import { useReactiveTransactions } from '~/sample-api-responses/useReactiveTransactions'
import { formatCurrency } from '~/lib/formatCurrency'
import { useAdminDateRangeStore } from '~/features/_admin/stores/adminDateRange'
import { enrichSubscriptions } from '~/features/_shared/utils/enrichSubscriptions'

// TODO-SUPABASE: Replace sample data import with:
// const { data } = await supabase.from('subscriptions').select('*, subscription_line_items(*)').eq('org_id', orgId)

/**
 * Composable for admin subscription management.
 * Provides all subscriptions with enriched donor info via enrichSubscriptions().
 */
export function useAdminSubscriptions() {
  const dateStore = useAdminDateRangeStore()
  const { transactions, subscriptions } = useReactiveTransactions()

  const allSubscriptions = computed(() =>
    enrichSubscriptions(
      subscriptions.value.filter((sub) => dateStore.isWithinRange(sub.createdAt)),
      transactions.value
    ).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
  )

  const activeSubscriptions = computed(() =>
    allSubscriptions.value.filter((s) => s.status === 'active')
  )

  const monthlyRecurringRevenue = computed(() =>
    activeSubscriptions.value.reduce((sum, s) => {
      const multiplier = s.frequency === 'yearly' ? 1 / 12 : 1
      return sum + s.totalAmount * s.exchangeRate * multiplier
    }, 0)
  )

  const totalLifetimeValue = computed(() =>
    allSubscriptions.value.reduce(
      (sum, s) => sum + s.totalAmount * s.exchangeRate * s.paymentCount,
      0
    )
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
    return [...transactions.value]
      .filter((t) => t.subscriptionId === subscriptionId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
  }

  return {
    allSubscriptions,
    subscriptions,
    activeSubscriptions,
    monthlyRecurringRevenue,
    stats,
    getSubscriptionById,
    getSubscriptionPayments
  }
}
