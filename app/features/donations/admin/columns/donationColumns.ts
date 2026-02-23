import { h } from 'vue'
import type { ColumnDef } from '@tanstack/vue-table'
import type { Transaction } from '~/features/donor-portal/types'
import { NuxtLink } from '#components'
import { RefreshCw } from 'lucide-vue-next'
import { Badge } from '@/components/ui/badge'
import {
  createDateColumn,
  createAmountColumn,
  createPaymentMethodColumn,
  createStatusColumn
} from '~/features/_shared/utils/column-builders'

export const donationColumns: ColumnDef<Transaction>[] = [
  createDateColumn<Transaction>({
    getUrl: (r) => `/admin/donations/${r.id}`
  }),
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
        ),
        row.original.giftAid
          ? h(Badge, { variant: 'outline', class: 'text-xs mt-0.5 w-fit' }, () => 'Gift Aid')
          : null
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
              NuxtLink,
              {
                to: `/admin/subscriptions/${row.original.subscriptionId}`,
                class: 'inline-flex items-center gap-1 text-xs text-primary hover:underline mt-0.5'
              },
              () => [h(RefreshCw, { class: 'size-3' }), 'Recurring']
            )
          : null
      ])
  },
  createPaymentMethodColumn<Transaction>(),
  createAmountColumn<Transaction>(),
  createStatusColumn<Transaction>()
]
