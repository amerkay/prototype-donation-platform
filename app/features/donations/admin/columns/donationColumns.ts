import { h } from 'vue'
import type { ColumnDef } from '@tanstack/vue-table'
import type { Transaction } from '~/features/donor-portal/types'
import { Button } from '@/components/ui/button'
import { ArrowUpDown, RefreshCw } from 'lucide-vue-next'
import { formatCurrency } from '~/lib/formatCurrency'
import { formatDate } from '~/lib/formatDate'
import { paymentMethodLabel } from '~/lib/formatPaymentMethod'
import StatusBadge from '~/components/StatusBadge.vue'

export const donationColumns: ColumnDef<Transaction>[] = [
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
    accessorKey: 'donorName',
    header: 'Donor',
    cell: ({ row }) =>
      h('div', { class: 'max-w-[160px]' }, [
        h(
          'span',
          { class: 'text-sm truncate block font-medium' },
          row.original.isAnonymous ? 'Anonymous' : (row.getValue('donorName') as string)
        ),
        h(
          'span',
          { class: 'text-xs text-muted-foreground truncate block' },
          row.original.donorEmail
        )
      ])
  },
  {
    accessorKey: 'campaignName',
    header: 'Campaign',
    cell: ({ row }) =>
      h('div', { class: 'max-w-[180px]' }, [
        h('span', { class: 'text-sm truncate block' }, row.getValue('campaignName') as string),
        row.original.subscriptionId
          ? h(
              'span',
              { class: 'inline-flex items-center gap-1 text-xs text-muted-foreground mt-0.5' },
              [h(RefreshCw, { class: 'size-3' }), 'Recurring']
            )
          : null
      ])
  },
  {
    id: 'paymentMethod',
    header: 'Payment',
    cell: ({ row }) =>
      h(
        'span',
        { class: 'text-sm whitespace-nowrap capitalize' },
        paymentMethodLabel(row.original.paymentMethod)
      )
  },
  {
    accessorKey: 'totalAmount',
    header: ({ column }) =>
      h(
        Button,
        {
          variant: 'ghost',
          onClick: () => column.toggleSorting(column.getIsSorted() === 'asc')
        },
        () => ['Amount', h(ArrowUpDown, { class: 'ml-2 h-4 w-4' })]
      ),
    cell: ({ row }) =>
      h(
        'div',
        { class: 'text-right font-medium text-sm whitespace-nowrap' },
        formatCurrency(row.original.totalAmount, row.original.currency)
      )
  },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }) => h(StatusBadge, { status: row.getValue('status') as string })
  }
]
