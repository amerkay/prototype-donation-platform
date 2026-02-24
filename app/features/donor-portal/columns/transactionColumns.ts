import { h } from 'vue'
import type { ColumnDef } from '@tanstack/vue-table'
import type { Transaction } from '~/features/donor-portal/types'
import { NuxtLink } from '#components'
import { RefreshCw } from 'lucide-vue-next'
import {
  createDateColumn,
  createAmountColumn,
  createPaymentMethodColumn,
  createStatusColumn
} from '~/features/_shared/utils/column-builders'
import { createViewActionColumn } from '~/features/_shared/utils/actionColumn'

export const transactionColumns: ColumnDef<Transaction>[] = [
  createDateColumn<Transaction>({
    getUrl: (r) => `/portal/donations/${r.id}`
  }),
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
              NuxtLink,
              {
                to: `/portal/subscriptions/${row.original.subscriptionId}`,
                class: 'inline-flex items-center gap-1 text-xs text-primary hover:underline mt-0.5'
              },
              () => [h(RefreshCw, { class: 'size-3' }), 'Subscription']
            )
          : null
      ])
  },
  createPaymentMethodColumn<Transaction>(),
  createAmountColumn<Transaction>({ buttonClass: '-mr-4' }),
  createStatusColumn<Transaction>(),
  createViewActionColumn<Transaction>((r) => `/portal/donations/${r.id}`)
]

/** Compact columns for dashboard preview (no sorting, fewer columns) */
export const transactionColumnsCompact: ColumnDef<Transaction>[] = [
  createDateColumn<Transaction>({
    sortable: false,
    getUrl: (r) => `/portal/donations/${r.id}`
  }),
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
              NuxtLink,
              {
                to: `/portal/subscriptions/${row.original.subscriptionId}`,
                class: 'inline-flex items-center gap-1 text-xs text-primary hover:underline mt-0.5'
              },
              () => [h(RefreshCw, { class: 'size-3' }), 'Subscription']
            )
          : null
      ])
  },
  createAmountColumn<Transaction>({ sortable: false, cellClass: 'text-right font-medium text-sm' }),
  createStatusColumn<Transaction>(),
  createViewActionColumn<Transaction>((r) => `/portal/donations/${r.id}`)
]
