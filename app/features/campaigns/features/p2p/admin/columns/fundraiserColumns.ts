import { h } from 'vue'
import type { ColumnDef } from '@tanstack/vue-table'
import { NuxtLink } from '#components'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { cn } from '@/lib/utils'
import { formatCurrency } from '~/lib/formatCurrency'
import { createDateColumn, createAmountColumn } from '~/features/_shared/utils/column-builders'
import StatusBadge from '~/components/StatusBadge.vue'
import type { CampaignFundraiser, MatchedGivingSettings } from '~/features/campaigns/shared/types'
import { getActivePeriod } from '~/features/campaigns/shared/utils/campaignCapabilities'

/** Matched giving context for a fundraiser: parent's matched giving + total pool drawn for this fundraiser */
export interface FundraiserMatchContext {
  matchedGiving: MatchedGivingSettings
  /** Total matched amount for this specific fundraiser (poolDrawn from parent periods) */
  totalMatched: number
}

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

/** Fundraiser name + campaign title link + avatar column + optional matched badge */
function createFundraiserColumn(options?: {
  getCampaignName?: (campaignId: string) => string
  getMatchContext?: (fundraiser: CampaignFundraiser) => FundraiserMatchContext | null
}): ColumnDef<CampaignFundraiser> {
  const { getCampaignName, getMatchContext } = options ?? {}
  return {
    accessorKey: 'name',
    header: 'Fundraiser',
    cell: ({ row }) => {
      const matchCtx = getMatchContext?.(row.original)
      const hasActivePeriod =
        matchCtx && getActivePeriod(matchCtx.matchedGiving.periods ?? []) != null

      return h('div', { class: 'flex items-center gap-3' }, [
        h(Avatar, { class: 'size-8' }, () =>
          h(AvatarFallback, { class: 'text-xs' }, () => getInitials(row.original.name))
        ),
        h('div', { class: 'min-w-0' }, [
          ...(getCampaignName
            ? [
                h('div', { class: 'flex items-center gap-1.5' }, [
                  h(
                    NuxtLink,
                    {
                      to: `/admin/p2p/fundraisers/${row.original.id}`,
                      class: 'text-sm text-primary hover:underline truncate'
                    },
                    () => getCampaignName(row.original.campaignId)
                  ),
                  ...(matchCtx
                    ? [
                        h(
                          Badge,
                          {
                            variant: hasActivePeriod ? 'secondary' : 'outline',
                            class: 'text-[10px] px-1.5 py-0 h-4 shrink-0'
                          },
                          () => 'Matched'
                        )
                      ]
                    : [])
                ])
              ]
            : []),
          h('div', { class: 'flex items-center gap-1.5' }, [
            h('span', { class: 'text-xs text-muted-foreground truncate' }, [
              'Fundraiser: ',
              h('span', { class: 'font-medium text-foreground' }, row.original.name)
            ]),
            // Badge for embedded view (no getCampaignName)
            ...(matchCtx && !getCampaignName
              ? [
                  h(
                    Badge,
                    {
                      variant: hasActivePeriod ? 'secondary' : 'outline',
                      class: 'text-[10px] px-1.5 py-0 h-4 shrink-0'
                    },
                    () => 'Matched'
                  )
                ]
              : [])
          ]),
          h('div', { class: 'mt-0.5' }, [h(StatusBadge, { status: row.original.status })])
        ])
      ])
    }
  }
}

/** Raised amount with progress bar subtext, optionally including matched total */
function createRaisedColumn(
  getMatchContext?: (fundraiser: CampaignFundraiser) => FundraiserMatchContext | null
): ColumnDef<CampaignFundraiser> {
  return createAmountColumn<CampaignFundraiser>({
    accessorKey: 'raisedAmount',
    label: 'Raised',
    getAmount: (row) => row.raisedAmount,
    getCurrency: (row) => row.currency,
    renderSubtext: (row) => {
      if (!row.goal) return null
      const matchCtx = getMatchContext?.(row)
      const effectiveTotal = matchCtx ? row.raisedAmount + matchCtx.totalMatched : row.raisedAmount
      const pct = Math.min((effectiveTotal / row.goal) * 100, 100)
      return h('div', { class: 'mt-1 space-y-1' }, [
        h(
          'span',
          { class: 'text-xs text-muted-foreground block text-right whitespace-nowrap' },
          matchCtx && matchCtx.totalMatched > 0
            ? `of ${formatCurrency(row.goal, row.currency)} · +${formatCurrency(matchCtx.totalMatched, row.currency)} matched`
            : `of ${formatCurrency(row.goal, row.currency)}`
        ),
        h(Progress, {
          modelValue: pct,
          class: cn('h-1.5 ml-auto', matchCtx ? 'w-full' : 'w-24')
        })
      ])
    }
  })
}

/** Donation count column */
function createDonationCountColumn(): ColumnDef<CampaignFundraiser> {
  return {
    accessorKey: 'donationCount',
    header: 'Donations',
    cell: ({ row }) => h('span', { class: 'text-sm' }, String(row.original.donationCount))
  }
}

/** Full columns for global list (campaign title shown above fundraiser name) */
export function fundraiserColumns(
  getCampaignName: (campaignId: string) => string,
  getMatchContext?: (fundraiser: CampaignFundraiser) => FundraiserMatchContext | null
): ColumnDef<CampaignFundraiser>[] {
  return [
    createFundraiserColumn({ getCampaignName, getMatchContext }),
    createRaisedColumn(getMatchContext),
    createDonationCountColumn(),
    createDateColumn<CampaignFundraiser>({ accessorKey: 'createdAt', label: 'Created' })
  ]
}

/** Embedded columns (no parent campaign column) */
export function embeddedFundraiserColumns(
  getMatchContext?: (fundraiser: CampaignFundraiser) => FundraiserMatchContext | null
): ColumnDef<CampaignFundraiser>[] {
  return [
    createFundraiserColumn({ getMatchContext }),
    createRaisedColumn(getMatchContext),
    createDonationCountColumn(),
    createDateColumn<CampaignFundraiser>({ accessorKey: 'createdAt', label: 'Created' })
  ]
}
