import { h } from 'vue'
import type { ColumnDef } from '@tanstack/vue-table'
import type { Transaction } from '~/features/donor-portal/types'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ArrowUpDown, RefreshCw } from 'lucide-vue-next'
import { formatCurrency } from '~/lib/formatCurrency'

const formatDate = (dateString: string): string =>
  new Intl.DateTimeFormat('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  }).format(new Date(dateString))

const paymentMethodLabel = (pm: Transaction['paymentMethod']): string => {
  if (pm.type === 'card' && pm.brand && pm.last4) return `${pm.brand} ****${pm.last4}`
  if (pm.type === 'paypal') return 'PayPal'
  if (pm.type === 'bank_transfer') return 'Bank Transfer'
  return pm.type
}

const statusBadgeAttrs = (status: string) => ({
  variant: 'outline' as const,
  'data-campaign-status': status,
  class: 'border-(--cs-border) text-(--cs-text)'
})

export const transactionColumns: ColumnDef<Transaction>[] = [
  {
    accessorKey: 'createdAt',
    header: ({ column }) =>
      h(
        Button,
        {
          variant: 'ghost',
          class: '-ml-4',
          onClick: () => column.toggleSorting(column.getIsSorted() === 'asc')
        },
        () => ['Date', h(ArrowUpDown, { class: 'ml-2 h-4 w-4' })]
      ),
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
            `${item.productIcon} ${item.productName}`,
            item.quantity > 1
              ? h('span', { class: 'text-muted-foreground' }, ` x${item.quantity}`)
              : null
          ])
        )
      )
    }
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
          class: '-ml-4',
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
    cell: ({ row }) => {
      const status = row.getValue('status') as Transaction['status']
      return h(Badge, statusBadgeAttrs(status), () => [
        h('span', { class: 'size-1.5 shrink-0 rounded-full bg-(--cs-dot)' }),
        status
      ])
    }
  }
]

/** Compact columns for dashboard preview (no sorting, fewer columns) */
export const transactionColumnsCompact: ColumnDef<Transaction>[] = [
  {
    accessorKey: 'createdAt',
    header: 'Date',
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
  {
    accessorKey: 'totalAmount',
    header: () => h('div', { class: 'text-right' }, 'Amount'),
    cell: ({ row }) =>
      h(
        'div',
        { class: 'text-right font-medium text-sm' },
        formatCurrency(row.original.totalAmount, row.original.currency)
      )
  },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }) => {
      const status = row.getValue('status') as Transaction['status']
      return h(Badge, statusBadgeAttrs(status), () => [
        h('span', { class: 'size-1.5 shrink-0 rounded-full bg-(--cs-dot)' }),
        status
      ])
    }
  }
]
