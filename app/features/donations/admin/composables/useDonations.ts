import type { Transaction } from '~/features/donor-portal/types'
import { transactions } from '~/sample-api-responses/api-sample-response-transactions'
import { formatCurrency } from '~/lib/formatCurrency'
import { useAdminDateRangeStore } from '~/features/_admin/stores/adminDateRange'

/**
 * Composable for admin donations management.
 * Provides all transactions across all donors for the admin view.
 */
export function useDonations() {
  const dateStore = useAdminDateRangeStore()

  const allTransactions = computed<Transaction[]>(() =>
    [...transactions].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )
  )

  const filteredTransactions = computed<Transaction[]>(() =>
    allTransactions.value.filter((t) => dateStore.isWithinRange(t.createdAt))
  )

  const succeededTransactions = computed(() =>
    allTransactions.value.filter((t) => t.status === 'succeeded')
  )

  const totalRevenue = computed(() =>
    succeededTransactions.value.reduce((sum, t) => sum + t.subtotal * t.exchangeRate, 0)
  )

  const totalDonations = computed(() => succeededTransactions.value.length)

  const averageDonation = computed(() =>
    totalDonations.value > 0 ? totalRevenue.value / totalDonations.value : 0
  )

  const coverCostsTotal = computed(() =>
    succeededTransactions.value.reduce((sum, t) => sum + t.coverCostsAmount * t.exchangeRate, 0)
  )

  const stats = computed(() => [
    { value: allTransactions.value.length, label: 'transactions' },
    { value: formatCurrency(totalRevenue.value, 'GBP', 0), label: 'revenue' },
    { value: formatCurrency(averageDonation.value, 'GBP'), label: 'avg donation' },
    { value: formatCurrency(coverCostsTotal.value, 'GBP'), label: 'cover costs' }
  ])

  function getTransactionById(id: string): Transaction | undefined {
    return allTransactions.value.find((t) => t.id === id)
  }

  return {
    allTransactions,
    filteredTransactions,
    totalRevenue,
    totalDonations,
    averageDonation,
    stats,
    getTransactionById
  }
}
