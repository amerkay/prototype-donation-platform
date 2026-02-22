import { h } from 'vue'
import type { ColumnDef } from '@tanstack/vue-table'
import type { Transaction } from '~/features/donor-portal/types'
import { Button } from '@/components/ui/button'
import { RefreshCw } from 'lucide-vue-next'
import { formatDate } from '~/lib/formatDate'
import {
  createDateColumn,
  createAmountColumn,
  createPaymentMethodColumn,
  createStatusColumn
} from '~/features/_admin/utils/column-builders'

export const transactionColumns: ColumnDef<Transaction>[] = [
  {
    ...createDateColumn<Transaction>(),
    // Override cell to add View button
    cell: ({ row }) =>
      h('div', { class: 'flex items-center gap-2' }, [
        h('span', { class: 'text-sm whitespace-nowrap' }, formatDate(row.getValue('createdAt'))),
        h(
          Button,
          { variant: 'link', size: 'sm', disabled: true, class: 'text-xs px-0 h-auto' },
          () => 'View'
        )
      ])
  },
  {
    accessorKey: 'campaignName',
    header: 'Campaign',
    cell: ({ row }) =>
      h('div', { class: 'max-w-[200px]' }, [
        h('span', { class: 'text-sm truncate block' }, row.getValue('campaignName') as string),
        h(
          'span',
          { class: 'text-xs text-muted-foreground truncate block' },
          row.original.charityName
        ),
        row.original.subscriptionId
          ? h(
              'a',
              {
                href: '/portal/subscriptions',
                class: 'inline-flex items-center gap-1 text-xs text-primary hover:underline mt-0.5'
              },
              [h(RefreshCw, { class: 'size-3' }), 'Subscription']
            )
          : null
      ])
  },
  {
    id: 'items',
    header: 'Items',
    cell: ({ row }) => {
      const items = row.original.lineItems
      return h(
        'div',
        { class: 'flex flex-col gap-0.5' },
        items.map((item) =>
          h('span', { class: 'text-sm whitespace-nowrap', key: item.productId }, [
            item.productTitle,
            item.quantity > 1
              ? h('span', { class: 'text-muted-foreground' }, ` x${item.quantity}`)
              : null
          ])
        )
      )
    }
  },
  createPaymentMethodColumn<Transaction>(),
  createAmountColumn<Transaction>({ buttonClass: '-mr-4' }),
  createStatusColumn<Transaction>()
]

/** Compact columns for dashboard preview (no sorting, fewer columns) */
export const transactionColumnsCompact: ColumnDef<Transaction>[] = [
  {
    ...createDateColumn<Transaction>({ sortable: false }),
    // Override cell to add View button
    cell: ({ row }) =>
      h('div', { class: 'flex items-center gap-2' }, [
        h('span', { class: 'text-sm whitespace-nowrap' }, formatDate(row.getValue('createdAt'))),
        h(
          Button,
          { variant: 'link', size: 'sm', disabled: true, class: 'text-xs px-0 h-auto' },
          () => 'View'
        )
      ])
  },
  {
    accessorKey: 'campaignName',
    header: 'Campaign',
    cell: ({ row }) =>
      h('div', { class: 'max-w-[180px]' }, [
        h('span', { class: 'text-sm truncate block' }, row.getValue('campaignName') as string),
        h(
          'span',
          { class: 'text-xs text-muted-foreground truncate block' },
          row.original.charityName
        ),
        row.original.subscriptionId
          ? h(
              'a',
              {
                href: '/portal/subscriptions',
                class: 'inline-flex items-center gap-1 text-xs text-primary hover:underline mt-0.5'
              },
              [h(RefreshCw, { class: 'size-3' }), 'Subscription']
            )
          : null
      ])
  },
  createAmountColumn<Transaction>({ sortable: false, cellClass: 'text-right font-medium text-sm' }),
  createStatusColumn<Transaction>()
]
