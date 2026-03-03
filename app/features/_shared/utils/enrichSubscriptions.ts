import type { Subscription } from '~/features/subscriptions/shared/types'
import type { Transaction } from '~/features/donor-portal/types'

/** Enriched subscription type with donor info from transactions */
export type EnrichedSubscription = Subscription & {
  donorName: string
  donorEmail: string
  donorId: string
}

/**
 * Enrich subscriptions with donor info derived from their first transaction.
 * Mirrors a Supabase join: subscriptions LEFT JOIN transactions ON subscription_id.
 *
 * TODO-SUPABASE: Replace with supabase.from('subscriptions').select('*, donors(name, email)')
 */
export function enrichSubscriptions(
  subscriptions: Subscription[],
  transactions: Transaction[]
): EnrichedSubscription[] {
  // Build donor lookup from first transaction per subscription
  const donorMap = new Map<string, { id: string; name: string; email: string }>()
  for (const txn of transactions) {
    if (txn.subscriptionId && !donorMap.has(txn.subscriptionId)) {
      donorMap.set(txn.subscriptionId, {
        id: txn.donorId,
        name: txn.donorName,
        email: txn.donorEmail
      })
    }
  }

  return subscriptions.map((sub) => {
    const donor = donorMap.get(sub.id)
    return {
      ...sub,
      donorId: donor?.id ?? (sub as EnrichedSubscription).donorId ?? '',
      donorName: donor?.name ?? (sub as EnrichedSubscription).donorName ?? 'Unknown',
      donorEmail: donor?.email ?? (sub as EnrichedSubscription).donorEmail ?? ''
    }
  })
}
