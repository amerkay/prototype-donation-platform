import type { Ref } from 'vue'
import { useEntityDataService } from '~/features/_shared/composables/useEntityDataService'

/**
 * Composable providing computed donor statistics from centralized entity data.
 * Used by DonorInfoCard and donors/[id] detail page for consistent stats.
 */
export function useDonorStats(donorId: Ref<string> | string) {
  const { transactionsByDonorId, subscriptionsByDonorId, donorById, isLoading } =
    useEntityDataService()

  const id = computed(() => (typeof donorId === 'string' ? donorId : donorId.value))

  const baseCurrency = computed(() => donorById.value.get(id.value)?.currency ?? 'GBP')

  const donorTransactions = computed(() => transactionsByDonorId.value.get(id.value) ?? [])
  const donorSubscriptions = computed(() => subscriptionsByDonorId.value.get(id.value) ?? [])

  const succeededTxns = computed(() =>
    donorTransactions.value.filter((t) => t.status === 'succeeded')
  )

  const totalDonated = computed(() =>
    succeededTxns.value.reduce((sum, t) => sum + t.totalAmount * t.exchangeRate, 0)
  )

  const donationCount = computed(() => succeededTxns.value.length)

  const avgDonation = computed(() =>
    donationCount.value > 0 ? totalDonated.value / donationCount.value : 0
  )

  const lastDonationDate = computed(() => {
    if (succeededTxns.value.length === 0) return null
    return succeededTxns.value.reduce((latest, t) => (t.createdAt > latest.createdAt ? t : latest))
      .createdAt
  })

  const activeSubscriptions = computed(() =>
    donorSubscriptions.value.filter((s) => s.status === 'active')
  )

  const monthlyRecurring = computed(() =>
    activeSubscriptions.value.reduce((sum, s) => {
      const multiplier = s.frequency === 'yearly' ? 1 / 12 : 1
      return sum + s.totalAmount * s.exchangeRate * multiplier
    }, 0)
  )

  return {
    isLoading,
    baseCurrency,
    totalDonated,
    donationCount,
    avgDonation,
    lastDonationDate,
    activeSubscriptions,
    monthlyRecurring
  }
}
