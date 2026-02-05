import { h } from 'vue'
import type { ColumnDef } from '@tanstack/vue-table'
import type { CampaignDonation } from '~/features/campaigns/shared/types'
import { Button } from '@/components/ui/button'
import { ArrowUpDown } from 'lucide-vue-next'
import { formatCurrency } from '~/lib/formatCurrency'

const formatDate = (dateString: string): string =>
  new Intl.DateTimeFormat('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  }).format(new Date(dateString))

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
  {
    accessorKey: 'createdAt',
    header: ({ column }) =>
      h(
        Button,
        {
          variant: 'ghost',
          class: '-ml-2.5',
          onClick: () => column.toggleSorting(column.getIsSorted() === 'asc')
        },
        () => ['Date', h(ArrowUpDown, { class: 'ml-2 h-4 w-4' })]
      ),
    cell: ({ row }) =>
      h('span', { class: 'text-sm whitespace-nowrap' }, formatDate(row.getValue('createdAt')))
  },
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
  {
    accessorKey: 'createdAt',
    header: 'Date',
    cell: ({ row }) =>
      h('span', { class: 'text-sm whitespace-nowrap' }, formatDate(row.getValue('createdAt')))
  },
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
