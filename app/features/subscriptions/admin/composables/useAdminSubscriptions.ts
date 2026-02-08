import type { Subscription } from '~/features/subscriptions/shared/types'
import {
  subscriptions,
  transactions
} from '~/sample-api-responses/api-sample-response-transactions'
import { formatCurrency } from '~/lib/formatCurrency'
import { useAdminDateRangeStore } from '~/features/_admin/stores/adminDateRange'

/**
 * Composable for admin subscription management.
 * Provides all subscriptions with enriched donor info from transactions.
 */
export function useAdminSubscriptions() {
  const dateStore = useAdminDateRangeStore()
  /** Map subscription IDs to donor info from their first transaction */
  const donorMap = computed(() => {
    const map = new Map<string, { name: string; email: string }>()
    for (const txn of transactions) {
      if (txn.subscriptionId && !map.has(txn.subscriptionId)) {
        map.set(txn.subscriptionId, { name: txn.donorName, email: txn.donorEmail })
      }
    }
    return map
  })

  const allSubscriptions = computed<(Subscription & { donorName: string; donorEmail: string })[]>(
    () =>
      [...subscriptions]
        .filter((sub) => dateStore.isWithinRange(sub.createdAt))
        .map((sub) => {
          const donor = donorMap.value.get(sub.id)
          return {
            ...sub,
            donorName: donor?.name ?? 'Unknown',
            donorEmail: donor?.email ?? ''
          }
        })
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
  )

  const activeSubscriptions = computed(() =>
    allSubscriptions.value.filter((s) => s.status === 'active')
  )

  const monthlyRecurringRevenue = computed(() =>
    activeSubscriptions.value
      .filter((s) => s.frequency === 'monthly')
      .reduce((sum, s) => sum + s.amount * s.exchangeRate, 0)
  )

  const totalLifetimeValue = computed(() =>
    allSubscriptions.value.reduce((sum, s) => sum + s.totalPaid * s.exchangeRate, 0)
  )

  const stats = computed(() => [
    { value: allSubscriptions.value.length, label: 'subscriptions' },
    { value: activeSubscriptions.value.length, label: 'active' },
    { value: formatCurrency(monthlyRecurringRevenue.value, 'GBP'), label: 'MRR' },
    { value: formatCurrency(totalLifetimeValue.value, 'GBP', 0), label: 'lifetime value' }
  ])

  function getSubscriptionById(id: string) {
    return allSubscriptions.value.find((s) => s.id === id)
  }

  function getSubscriptionPayments(subscriptionId: string) {
    return [...transactions]
      .filter((t) => t.subscriptionId === subscriptionId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
  }

  return {
    allSubscriptions,
    activeSubscriptions,
    monthlyRecurringRevenue,
    stats,
    getSubscriptionById,
    getSubscriptionPayments
  }
}
