import type { Donor } from '~/features/donors/admin/types'
import type { Transaction } from '~/features/donor-portal/types'

/**
 * Build a donor map by aggregating succeeded transactions.
 * Mirrors the Supabase `donors_summary_view` — a single swap point for migration.
 *
 * TODO-SUPABASE: Replace with supabase.from('donors_summary_view').select('*').eq('org_id', orgId)
 */
export function buildDonorMap(transactions: Transaction[]): Map<string, Donor> {
  const map = new Map<string, Donor>()

  for (const txn of transactions) {
    if (txn.status !== 'succeeded') continue

    const existing = map.get(txn.donorId)
    const baseAmount = txn.totalAmount * txn.exchangeRate

    if (existing) {
      existing.totalDonated += baseAmount
      existing.donationCount++
      if (txn.createdAt > existing.lastDonationDate) {
        existing.lastDonationDate = txn.createdAt
        existing.name = txn.isAnonymous ? existing.name : txn.donorName
      }
      if (txn.giftAid) existing.giftAid = true
    } else {
      map.set(txn.donorId, {
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

  return map
}

/**
 * Build a sorted donor array from transactions.
 * Convenience wrapper over buildDonorMap for list consumers.
 */
export function buildDonorList(transactions: Transaction[]): Donor[] {
  return [...buildDonorMap(transactions).values()].sort(
    (a, b) => new Date(b.lastDonationDate).getTime() - new Date(a.lastDonationDate).getTime()
  )
}
