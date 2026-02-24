import type { ColumnDef } from '@tanstack/vue-table'
import type { Transaction } from '~/features/donor-portal/types'
import {
  createDateColumn,
  createAmountColumn,
  createStatusColumn
} from '~/features/_shared/utils/column-builders'
import { createViewActionColumn } from '~/features/_shared/utils/actionColumn'

export const subscriptionPaymentColumns: ColumnDef<Transaction>[] = [
  createDateColumn<Transaction>({
    getUrl: (r) => `/portal/donations/${r.id}`
  }),
  createAmountColumn<Transaction>({ cellClass: 'text-right font-medium text-sm' }),
  createStatusColumn<Transaction>(),
  createViewActionColumn<Transaction>((r) => `/portal/donations/${r.id}`)
]
