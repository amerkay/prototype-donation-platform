import { ref, computed } from 'vue'
import type { Transaction } from '~/features/donor-portal/types'
import type { Donor } from '~/features/donors/admin/types'
import { useReactiveTransactions } from '~/sample-api-responses/useReactiveTransactions'
import { buildDonorList } from '~/features/_shared/utils/buildDonorMap'
import {
  enrichSubscriptions,
  type EnrichedSubscription
} from '~/features/_shared/utils/enrichSubscriptions'

// Re-export for consumers that imported EnrichedSubscription from here
export type { EnrichedSubscription }

// TODO-SUPABASE: Replace useReactiveTransactions with direct Supabase queries.
// This composable may be retired entirely — see SUPABASE_NOTES.md for details.

/**
 * Centralized entity data service with cross-entity lookup maps.
 * Simulates async Supabase data loading with a brief delay.
 * Singleton — all admin list pages share the same instance.
 */
let _instance: ReturnType<typeof createDataService> | null = null

function createDataService() {
  const isLoading = ref(true)
  const { transactions: rawTxns, subscriptions: rawSubs } = useReactiveTransactions()

  // Simulate async data fetch (mirrors future Supabase await)
  const ready = ref(false)
  Promise.resolve().then(() => {
    setTimeout(() => {
      ready.value = true
      isLoading.value = false
    }, 1000)
  })

  const transactions = computed(() => {
    if (!ready.value) return [] as Transaction[]
    return [...rawTxns.value].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )
  })

  const donors = computed(() => {
    if (!ready.value) return [] as Donor[]
    return buildDonorList(rawTxns.value)
  })

  const subscriptions = computed(() => {
    if (!ready.value) return [] as EnrichedSubscription[]
    return enrichSubscriptions(rawSubs.value, rawTxns.value)
  })

  /** Map: donorId → Donor */
  const donorById = computed(() => {
    const map = new Map<string, Donor>()
    for (const d of donors.value) map.set(d.id, d)
    return map
  })

  /** Map: donorId → Transaction[] */
  const transactionsByDonorId = computed(() => {
    const map = new Map<string, Transaction[]>()
    for (const t of transactions.value) {
      const arr = map.get(t.donorId) ?? []
      arr.push(t)
      map.set(t.donorId, arr)
    }
    return map
  })

  /** Map: donorId → Subscription[] */
  const subscriptionsByDonorId = computed(() => {
    const map = new Map<string, EnrichedSubscription[]>()
    for (const s of subscriptions.value) {
      if (!s.donorId) continue
      const arr = map.get(s.donorId) ?? []
      arr.push(s)
      map.set(s.donorId, arr)
    }
    return map
  })

  /** Map: subscriptionId → donorId */
  const donorIdBySubscriptionId = computed(() => {
    const map = new Map<string, string>()
    for (const s of subscriptions.value) {
      if (s.donorId) map.set(s.id, s.donorId)
    }
    return map
  })

  return {
    isLoading,
    transactions,
    subscriptions,
    donors,
    donorById,
    transactionsByDonorId,
    subscriptionsByDonorId,
    donorIdBySubscriptionId
  }
}

export function useEntityDataService() {
  if (!_instance) {
    _instance = createDataService()
  }
  return _instance
}
