import { h } from 'vue'
import type { ColumnDef } from '@tanstack/vue-table'
import type { Subscription } from '~/features/subscriptions/shared/types'
import { Button } from '@/components/ui/button'
import { ArrowUpDown } from 'lucide-vue-next'
import { formatCurrency } from '~/lib/formatCurrency'
import { formatDate } from '~/lib/formatDate'
import {
  createPaymentMethodColumn,
  createStatusColumn
} from '~/features/_admin/utils/column-builders'

type EnrichedSubscription = Subscription & { donorName: string; donorEmail: string }

export const subscriptionColumns: ColumnDef<EnrichedSubscription>[] = [
  {
    accessorKey: 'donorName',
    header: ({ column }) =>
      h(
        Button,
        {
          variant: 'ghost',
          class: '-ml-2.5',
          onClick: () => column.toggleSorting(column.getIsSorted() === 'asc')
        },
        () => ['Donor', h(ArrowUpDown, { class: 'ml-2 h-4 w-4' })]
      ),
    cell: ({ row }) =>
      h('div', {}, [
        h('span', { class: 'text-sm font-medium' }, row.getValue('donorName') as string),
        h('span', { class: 'text-xs text-muted-foreground block' }, row.original.donorEmail)
      ])
  },
  {
    accessorKey: 'campaignName',
    header: 'Campaign',
    cell: ({ row }) =>
      h('div', { class: 'max-w-[180px]' }, [
        h('span', { class: 'text-sm truncate block' }, row.getValue('campaignName') as string),
        h('span', { class: 'text-xs text-muted-foreground' }, row.original.charityName)
      ])
  },
  {
    accessorKey: 'amount',
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
      h('div', {}, [
        h(
          'span',
          { class: 'text-sm font-medium' },
          formatCurrency(row.original.amount, row.original.currency)
        ),
        h(
          'span',
          { class: 'text-xs text-muted-foreground block capitalize' },
          `/ ${row.original.frequency}`
        )
      ])
  },
  createPaymentMethodColumn<EnrichedSubscription>(),
  {
    accessorKey: 'nextBillingDate',
    header: 'Next Billing',
    cell: ({ row }) => {
      const date = row.original.nextBillingDate
      return date
        ? h('span', { class: 'text-sm' }, formatDate(date))
        : h('span', { class: 'text-xs text-muted-foreground' }, '—')
    }
  },
  {
    accessorKey: 'totalPaid',
    header: ({ column }) =>
      h(
        Button,
        {
          variant: 'ghost',
          onClick: () => column.toggleSorting(column.getIsSorted() === 'asc')
        },
        () => ['Lifetime', h(ArrowUpDown, { class: 'ml-2 h-4 w-4' })]
      ),
    cell: ({ row }) =>
      h('div', {}, [
        h(
          'span',
          { class: 'text-sm font-medium' },
          formatCurrency(row.original.totalPaid, row.original.currency)
        ),
        h(
          'span',
          { class: 'text-xs text-muted-foreground block' },
          `${row.original.paymentCount} payments`
        )
      ])
  },
  createStatusColumn<EnrichedSubscription>()
]
