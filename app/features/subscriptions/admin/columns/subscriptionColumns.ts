import { h } from 'vue'
import type { ColumnDef } from '@tanstack/vue-table'
import type { Subscription } from '~/features/subscriptions/shared/types'
import { NuxtLink } from '#components'
import { Button } from '@/components/ui/button'
import { ArrowUpDown } from 'lucide-vue-next'
import { formatCurrency } from '~/lib/formatCurrency'
import { formatDate } from '~/lib/formatDate'
import {
  createPaymentMethodColumn,
  createStatusColumn
} from '~/features/_shared/utils/column-builders'

type EnrichedSubscription = Subscription & {
  donorId: string
  donorName: string
  donorEmail: string
}

export const subscriptionColumns: ColumnDef<EnrichedSubscription>[] = [
  {
    accessorKey: 'createdAt',
    header: ({ column }) =>
      h(
        Button,
        {
          variant: 'ghost',
          onClick: () => column.toggleSorting(column.getIsSorted() === 'asc')
        },
        () => ['Started', h(ArrowUpDown, { class: 'ml-2 h-4 w-4' })]
      ),
    cell: ({ row }) =>
      h('div', {}, [
        h(
          NuxtLink,
          {
            to: `/admin/subscriptions/${row.original.id}`,
            class: 'text-sm font-medium text-primary hover:underline whitespace-nowrap'
          },
          () => formatDate(row.getValue('createdAt') as string)
        ),
        h('span', { class: 'text-sm truncate block' }, row.original.donorName),
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
