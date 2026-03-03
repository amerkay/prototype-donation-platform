import { h } from 'vue'
import type { ColumnDef } from '@tanstack/vue-table'
import { NuxtLink } from '#components'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Progress } from '@/components/ui/progress'
import { formatCurrency } from '~/lib/formatCurrency'
import {
  createDateColumn,
  createStatusColumn,
  createAmountColumn
} from '~/features/_shared/utils/column-builders'
import type { CampaignFundraiser } from '~/features/campaigns/shared/types'

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

/** Fundraiser name + campaign title link + avatar column */
function createFundraiserColumn(
  getCampaignName?: (campaignId: string) => string
): ColumnDef<CampaignFundraiser> {
  return {
    accessorKey: 'name',
    header: 'Fundraiser',
    cell: ({ row }) =>
      h('div', { class: 'flex items-center gap-3' }, [
        h(Avatar, { class: 'size-8' }, () =>
          h(AvatarFallback, { class: 'text-xs' }, () => getInitials(row.original.name))
        ),
        h('div', { class: 'min-w-0' }, [
          ...(getCampaignName
            ? [
                h(
                  NuxtLink,
                  {
                    to: `/admin/p2p/fundraisers/${row.original.id}`,
                    class: 'text-sm text-primary hover:underline block truncate'
                  },
                  () => getCampaignName(row.original.campaignId)
                )
              ]
            : []),
          h('span', { class: 'text-xs text-muted-foreground block truncate' }, [
            'Fundraiser: ',
            h('span', { class: 'font-medium text-foreground' }, row.original.name)
          ])
        ])
      ])
  }
}

/** Raised amount with progress bar subtext */
function createRaisedColumn(): ColumnDef<CampaignFundraiser> {
  return createAmountColumn<CampaignFundraiser>({
    accessorKey: 'raisedAmount',
    label: 'Raised',
    getAmount: (row) => row.raisedAmount,
    getCurrency: (row) => row.currency,
    renderSubtext: (row) => {
      if (!row.goal) return null
      const pct = Math.min((row.raisedAmount / row.goal) * 100, 100)
      return h('div', { class: 'mt-1 space-y-1' }, [
        h(
          'span',
          { class: 'text-xs text-muted-foreground block text-right' },
          `of ${formatCurrency(row.goal, row.currency)}`
        ),
        h(Progress, { modelValue: pct, class: 'h-1.5 w-24 ml-auto' })
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
  getCampaignName: (campaignId: string) => string
): ColumnDef<CampaignFundraiser>[] {
  return [
    createFundraiserColumn(getCampaignName),
    createRaisedColumn(),
    createDonationCountColumn(),
    createDateColumn<CampaignFundraiser>({ accessorKey: 'createdAt', label: 'Created' }),
    createStatusColumn<CampaignFundraiser>()
  ]
}

/** Embedded columns (no parent campaign column) */
export function embeddedFundraiserColumns(): ColumnDef<CampaignFundraiser>[] {
  return [
    createFundraiserColumn(),
    createRaisedColumn(),
    createDonationCountColumn(),
    createDateColumn<CampaignFundraiser>({ accessorKey: 'createdAt', label: 'Created' }),
    createStatusColumn<CampaignFundraiser>()
  ]
}
