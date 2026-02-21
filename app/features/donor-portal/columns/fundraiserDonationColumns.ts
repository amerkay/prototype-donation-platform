import { h } from 'vue'
import type { ColumnDef } from '@tanstack/vue-table'
import type { CampaignDonation } from '~/features/campaigns/shared/types'
import { Button } from '@/components/ui/button'
import { ArrowUpDown } from 'lucide-vue-next'
import { formatCurrency } from '~/lib/formatCurrency'
import { createDateColumn } from '~/features/_admin/utils/column-builders'

/**
 * Privacy-respecting donor name: "FirstName L." or "Anonymous"
 */
const initializedName = (donation: CampaignDonation): string => {
  if (donation.isAnonymous) return 'Anonymous'
  const parts = donation.donorName.split(' ')
  if (parts.length < 2) return parts[0] ?? ''
  return `${parts[0]} ${parts[parts.length - 1]![0]}.`
}

export const fundraiserDonationColumns: ColumnDef<CampaignDonation>[] = [
  createDateColumn<CampaignDonation>(),
  {
    id: 'donor',
    header: 'Donor',
    cell: ({ row }) => h('span', { class: 'text-sm' }, initializedName(row.original))
  },
  {
    accessorKey: 'amount',
    header: ({ column }) =>
      h('div', { class: 'flex justify-end' }, [
        h(
          Button,
          {
            variant: 'ghost',
            class: '-mr-2',
            onClick: () => column.toggleSorting(column.getIsSorted() === 'asc')
          },
          () => ['Amount', h(ArrowUpDown, { class: 'ml-2 h-4 w-4' })]
        )
      ]),
    cell: ({ row }) =>
      h(
        'div',
        { class: 'text-right font-medium text-sm whitespace-nowrap mr-1' },
        formatCurrency(row.original.amount, row.original.currency)
      )
  }
]

/** Compact version for dashboard preview (no sorting) */
export const fundraiserDonationColumnsCompact: ColumnDef<CampaignDonation>[] = [
  createDateColumn<CampaignDonation>({ sortable: false }),
  {
    id: 'donor',
    header: 'Donor',
    cell: ({ row }) => h('span', { class: 'text-sm' }, initializedName(row.original))
  },
  {
    accessorKey: 'amount',
    header: () => h('div', { class: 'text-right' }, 'Amount'),
    cell: ({ row }) =>
      h(
        'div',
        { class: 'text-right font-medium text-sm' },
        formatCurrency(row.original.amount, row.original.currency)
      )
  }
]
