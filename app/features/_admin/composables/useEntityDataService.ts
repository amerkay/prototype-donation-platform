import { ref, computed } from 'vue'
import type { Transaction } from '~/features/donor-portal/types'
import type { Subscription } from '~/features/subscriptions/shared/types'
import type { Donor } from '~/features/donors/admin/types'
import {
  transactions as rawTransactions,
  subscriptions as rawSubscriptions
} from '~/sample-api-responses/api-sample-response-transactions'

/** Enriched subscription type with donor info */
export type EnrichedSubscription = Subscription & {
  donorName: string
  donorEmail: string
  donorId: string
}

/**
 * Centralized entity data service with cross-entity lookup maps.
 * Simulates async Supabase data loading with a 1s initial delay.
 * Singleton — all admin list pages share the same instance.
 */
let _instance: ReturnType<typeof createDataService> | null = null

function createDataService() {
  const isLoading = ref(true)
  const transactions = ref<Transaction[]>([])
  const subscriptions = ref<EnrichedSubscription[]>([])
  const donors = ref<Donor[]>([])

  // Simulate async data fetch
  setTimeout(() => {
    const sortedTxns = [...rawTransactions].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )
    transactions.value = sortedTxns

    // Build donor map from transactions (same logic as useDonors)
    const donorMap = new Map<string, Donor>()
    for (const txn of rawTransactions) {
      if (txn.status !== 'succeeded') continue
      const existing = donorMap.get(txn.donorId)
      const baseAmount = txn.subtotal * txn.exchangeRate
      if (existing) {
        existing.totalDonated += baseAmount
        existing.donationCount++
        if (txn.createdAt > existing.lastDonationDate) {
          existing.lastDonationDate = txn.createdAt
          existing.name = txn.isAnonymous ? existing.name : txn.donorName
        }
        if (txn.giftAid) existing.giftAid = true
      } else {
        donorMap.set(txn.donorId, {
          id: txn.donorId,
          email: txn.donorEmail,
          name: txn.isAnonymous ? 'Anonymous' : txn.donorName,
          totalDonated: baseAmount,
          donationCount: 1,
          currency: 'GBP',
          lastDonationDate: txn.createdAt,
          giftAid: txn.giftAid,
          isAnonymous: txn.isAnonymous
        })
      }
    }
    donors.value = [...donorMap.values()]

    // Build subscription donor map from transactions
    const subDonorMap = new Map<string, { name: string; email: string; donorId: string }>()
    for (const txn of rawTransactions) {
      if (txn.subscriptionId && !subDonorMap.has(txn.subscriptionId)) {
        subDonorMap.set(txn.subscriptionId, {
          name: txn.donorName,
          email: txn.donorEmail,
          donorId: txn.donorId
        })
      }
    }
    subscriptions.value = [...rawSubscriptions].map((sub) => {
      const donor = subDonorMap.get(sub.id)
      return {
        ...sub,
        donorName: donor?.name ?? 'Unknown',
        donorEmail: donor?.email ?? '',
        donorId: donor?.donorId ?? ''
      }
    })

    isLoading.value = false
  }, 1000)

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
