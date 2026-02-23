import type { Transaction } from '~/features/donor-portal/types'
import type { Subscription } from '~/features/subscriptions/shared/types'
import { useSessionStorageSingleton } from '~/features/_admin/composables/useSessionStorageSingleton'
import {
  transactions as sampleTransactions,
  subscriptions as sampleSubscriptions
} from './api-sample-response-transactions'

const transactionStore = useSessionStorageSingleton<Transaction>(
  'sample-transactions',
  sampleTransactions
)

const subscriptionStore = useSessionStorageSingleton<Subscription>(
  'sample-subscriptions',
  sampleSubscriptions
)

/**
 * Reactive wrapper around sample transactions + subscriptions.
 * Session-storage-backed so new records persist across page refreshes.
 */
export function useReactiveTransactions() {
  transactionStore.ensureHydrated()
  subscriptionStore.ensureHydrated()

  function addTransaction(t: Transaction) {
    transactionStore.items.value.unshift(t)
    transactionStore.$persist()
  }

  function addSubscription(s: Subscription) {
    subscriptionStore.items.value.unshift(s)
    subscriptionStore.$persist()
  }

  return {
    transactions: transactionStore.items,
    subscriptions: subscriptionStore.items,
    addTransaction,
    addSubscription
  }
}
