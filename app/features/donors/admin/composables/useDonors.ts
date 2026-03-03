import type { Donor } from '~/features/donors/admin/types'
import type { Transaction } from '~/features/donor-portal/types'
import { useReactiveTransactions } from '~/sample-api-responses/useReactiveTransactions'
import { formatCurrency } from '~/lib/formatCurrency'
import { useAdminDateRangeStore } from '~/features/_admin/stores/adminDateRange'
import { buildDonorList } from '~/features/_shared/utils/buildDonorMap'

// TODO-SUPABASE: Replace sample data import with:
// const { data } = await supabase.from('donors_summary_view').select('*').eq('org_id', orgId)

/**
 * Composable for admin donor management.
 * Aggregates unique donors from the master transactions table via buildDonorList().
 */
export function useDonors() {
  const dateStore = useAdminDateRangeStore()
  const { transactions } = useReactiveTransactions()

  const donors = computed(() => {
    const filtered = transactions.value.filter((t) => dateStore.isWithinRange(t.createdAt))
    return buildDonorList(filtered)
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
    return [...transactions.value]
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
