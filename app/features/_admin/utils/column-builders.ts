import { h } from 'vue'
import type { ColumnDef } from '@tanstack/vue-table'
import { Button } from '@/components/ui/button'
import { ArrowUpDown } from 'lucide-vue-next'
import { formatCurrency } from '~/lib/formatCurrency'
import { formatDate } from '~/lib/formatDate'
import { paymentMethodLabel } from '~/lib/formatPaymentMethod'
import StatusBadge from '~/components/StatusBadge.vue'
import type { PaymentMethod } from '~/features/donor-portal/types'

interface DateColumnOptions {
  /** Accessor key for the date field (default: 'createdAt') */
  accessorKey?: string
  /** Column header label (default: 'Date') */
  label?: string
  /** Enable sorting (default: true) */
  sortable?: boolean
  /** CSS class for the button (default: '-ml-2.5') */
  buttonClass?: string
  /** CSS class for the cell (default: 'text-sm whitespace-nowrap') */
  cellClass?: string
}

interface AmountColumnOptions<T> {
  /** Accessor key for the amount field (default: 'totalAmount') */
  accessorKey?: string
  /** Column header label (default: 'Amount') */
  label?: string
  /** Enable sorting (default: true) */
  sortable?: boolean
  /** CSS class for the button (default: '') */
  buttonClass?: string
  /** CSS class for the cell container (default: 'text-right font-medium text-sm whitespace-nowrap') */
  cellClass?: string
  /** Function to get the amount from the row (default: row.original.totalAmount or row.original.amount) */
  getAmount?: (row: T) => number
  /** Function to get the currency from the row (default: row.original.currency) */
  getCurrency?: (row: T) => string
  /** Additional content to render below the amount */
  renderSubtext?: (row: T) => ReturnType<typeof h> | null
}

interface StatusColumnOptions {
  /** Accessor key for the status field (default: 'status') */
  accessorKey?: string
  /** Column header label (default: 'Status') */
  label?: string
}

interface PaymentMethodColumnOptions {
  /** Column ID (default: 'paymentMethod') */
  id?: string
  /** Column header label (default: 'Payment') */
  label?: string
  /** CSS class for the cell (default: 'text-sm whitespace-nowrap capitalize') */
  cellClass?: string
}

/**
 * Create a date column with optional sorting and custom formatting.
 *
 * @example
 * ```ts
 * createDateColumn() // Default sortable date column
 * createDateColumn({ sortable: false }) // Non-sortable date column
 * createDateColumn({ label: 'Created', cellClass: 'text-xs' }) // Custom label and styling
 * ```
 */
export function createDateColumn<T>(options: DateColumnOptions = {}): ColumnDef<T> {
  const {
    accessorKey = 'createdAt',
    label = 'Date',
    sortable = true,
    buttonClass = '-ml-2.5',
    cellClass = 'text-sm whitespace-nowrap'
  } = options

  return {
    accessorKey,
    header: sortable
      ? ({ column }) =>
          h(
            Button,
            {
              variant: 'ghost',
              class: buttonClass,
              onClick: () => column.toggleSorting(column.getIsSorted() === 'asc')
            },
            () => [label, h(ArrowUpDown, { class: 'ml-2 h-4 w-4' })]
          )
      : label,
    cell: ({ row }) => h('span', { class: cellClass }, formatDate(row.getValue(accessorKey)))
  }
}

/**
 * Create an amount column with currency formatting, optional sorting, and optional subtext.
 *
 * @example
 * ```ts
 * // Basic amount column
 * createAmountColumn()
 *
 * // Amount with frequency subtext
 * createAmountColumn({
 *   renderSubtext: (row) => h('span', { class: 'text-xs text-muted-foreground block capitalize' }, `/ ${row.frequency}`)
 * })
 *
 * // Non-sortable amount with custom accessor
 * createAmountColumn({ accessorKey: 'amount', sortable: false })
 * ```
 */
export function createAmountColumn<T>(options: AmountColumnOptions<T> = {}): ColumnDef<T> {
  const {
    accessorKey = 'totalAmount',
    label = 'Amount',
    sortable = true,
    buttonClass = '',
    cellClass = 'text-right font-medium text-sm whitespace-nowrap',
    getAmount,
    getCurrency,
    renderSubtext
  } = options

  return {
    accessorKey,
    header: sortable
      ? ({ column }) =>
          h(
            Button,
            {
              variant: 'ghost',
              class: buttonClass,
              onClick: () => column.toggleSorting(column.getIsSorted() === 'asc')
            },
            () => [label, h(ArrowUpDown, { class: 'ml-2 h-4 w-4' })]
          )
      : () => h('div', { class: 'text-right' }, label),
    cell: ({ row }) => {
      const original = row.original as Record<string, unknown>
      const amount = getAmount ? getAmount(row.original) : (original[accessorKey] as number)
      const currency = getCurrency ? getCurrency(row.original) : (original.currency as string)
      const subtext = renderSubtext ? renderSubtext(row.original) : null

      return h('div', { class: cellClass }, [
        formatCurrency(amount, currency),
        subtext && h('div', {}, subtext)
      ])
    }
  }
}

/**
 * Create a payment method column with capitalized labels.
 *
 * @example
 * ```ts
 * createPaymentMethodColumn() // Default payment method column
 * createPaymentMethodColumn({ label: 'Method' }) // Custom label
 * ```
 */
export function createPaymentMethodColumn<T>(
  options: PaymentMethodColumnOptions = {}
): ColumnDef<T> {
  const {
    id = 'paymentMethod',
    label = 'Payment',
    cellClass = 'text-sm whitespace-nowrap capitalize'
  } = options

  return {
    id,
    header: label,
    cell: ({ row }) => {
      const original = row.original as Record<string, unknown>
      return h(
        'span',
        { class: cellClass },
        paymentMethodLabel(original.paymentMethod as PaymentMethod)
      )
    }
  }
}

/**
 * Create a status column with StatusBadge component.
 *
 * @example
 * ```ts
 * createStatusColumn() // Default status column
 * createStatusColumn({ label: 'Current Status' }) // Custom label
 * ```
 */
export function createStatusColumn<T>(options: StatusColumnOptions = {}): ColumnDef<T> {
  const { accessorKey = 'status', label = 'Status' } = options

  return {
    accessorKey,
    header: label,
    cell: ({ row }) => h(StatusBadge, { status: row.getValue(accessorKey) as string })
  }
}
