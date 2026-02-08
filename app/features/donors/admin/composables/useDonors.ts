import type { Donor } from '~/features/donors/admin/types'
import type { Transaction } from '~/features/donor-portal/types'
import { transactions } from '~/sample-api-responses/api-sample-response-transactions'
import { formatCurrency } from '~/lib/formatCurrency'
import { useAdminDateRangeStore } from '~/features/_admin/stores/adminDateRange'

/**
 * Composable for admin donor management.
 * Aggregates unique donors from the master transactions table.
 */
export function useDonors() {
  const dateStore = useAdminDateRangeStore()

  const donors = computed<Donor[]>(() => {
    const map = new Map<string, Donor>()

    for (const txn of transactions) {
      if (txn.status !== 'succeeded') continue
      if (!dateStore.isWithinRange(txn.createdAt)) continue

      const existing = map.get(txn.donorId)
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

    return [...map.values()].sort(
      (a, b) => new Date(b.lastDonationDate).getTime() - new Date(a.lastDonationDate).getTime()
    )
  })

  const totalDonors = computed(() => donors.value.length)

  const totalRevenue = computed(() => donors.value.reduce((sum, d) => sum + d.totalDonated, 0))

  const averageDonation = computed(() => {
    const totalDonations = donors.value.reduce((sum, d) => sum + d.donationCount, 0)
    return totalDonations > 0 ? totalRevenue.value / totalDonations : 0
  })

  const giftAidDonors = computed(() => donors.value.filter((d) => d.giftAid).length)

  const stats = computed(() => [
    { value: totalDonors.value, label: 'donors' },
    { value: formatCurrency(totalRevenue.value, 'GBP', 0), label: 'total revenue' },
    { value: formatCurrency(averageDonation.value, 'GBP'), label: 'avg donation' },
    { value: giftAidDonors.value, label: 'Gift Aid eligible' }
  ])

  function getDonorById(id: string): Donor | undefined {
    return donors.value.find((d) => d.id === id)
  }

  function getDonorTransactionsById(id: string): Transaction[] {
    return [...transactions]
      .filter((t) => t.donorId === id)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
  }

  return {
    donors,
    totalDonors,
    totalRevenue,
    averageDonation,
    stats,
    getDonorById,
    getDonorTransactionsById
  }
}
