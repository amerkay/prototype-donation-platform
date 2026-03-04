import { useCampaigns } from '~/features/campaigns/shared/composables/useCampaigns'
import { useReactiveTransactions } from '~/sample-api-responses/useReactiveTransactions'
import type { Campaign } from '~/features/campaigns/shared/types'

// TODO-SUPABASE: Replace with auth.uid() from supabase.auth.getUser()
const CURRENT_USER_EMAIL = 'awesome@charity.co.uk'

/**
 * Composable for the donor portal.
 * Provides transactions, subscriptions, current user's fundraisers, and computed stats.
 */
export function useDonorPortal() {
  const { campaigns } = useCampaigns()

  // TODO-SUPABASE: Replace with supabase.from('transactions').select('*').eq('donor_id', auth.uid()) (RLS auto-filters)
  const {
    transactions: allTransactions,
    subscriptions: allSubscriptions,
    addTransaction
  } = useReactiveTransactions()

  const transactions = computed(() =>
    allTransactions.value.filter((t) => t.donorEmail === CURRENT_USER_EMAIL)
  )

  const subscriptions = computed(() =>
    allSubscriptions.value.filter((s) => s.donorEmail === CURRENT_USER_EMAIL)
  )

  // Current user's fundraiser campaigns
  const currentUserFundraisers = computed(() => {
    const result: Campaign[] = []
    for (const campaign of campaigns.value) {
      if (campaign.type !== 'p2p-fundraiser') continue
      const parent = campaigns.value.find((c) => c.id === campaign.parentCampaignId)
      if (!parent) continue
      const match = parent.fundraisers.find(
        (f) => f.campaignId === campaign.id && f.email === CURRENT_USER_EMAIL
      )
      if (match) result.push(campaign)
    }
    return result
  })

  const succeededTransactions = computed(() =>
    transactions.value.filter((t) => t.status === 'succeeded')
  )

  const activeSubscriptions = computed(() =>
    subscriptions.value.filter((s) => s.status === 'active')
  )

  const activeFundraisers = computed(() =>
    currentUserFundraisers.value.filter((c) => c.status === 'active')
  )

  /** Donor value per org (last 12 months), keyed by charityName — base currency */
  const donorValueByOrg = computed(() => {
    const oneYearAgo = Date.now() - 365.25 * 24 * 60 * 60 * 1000
    const map = new Map<string, number>()
    for (const t of succeededTransactions.value) {
      if (new Date(t.createdAt).getTime() < oneYearAgo) continue
      map.set(t.charityName, (map.get(t.charityName) ?? 0) + t.totalAmount * t.exchangeRate)
    }
    return map
  })

  const totalDonated = computed(() =>
    succeededTransactions.value.reduce((sum, t) => sum + t.totalAmount * t.exchangeRate, 0)
  )

  const hasMultiCurrencyDonations = computed(() =>
    succeededTransactions.value.some((t) => t.currency !== t.baseCurrency)
  )

  const totalTransactions = computed(() => succeededTransactions.value.length)

  return {
    transactions,
    subscriptions,
    currentUserFundraisers,
    succeededTransactions,
    activeSubscriptions,
    activeFundraisers,
    totalDonated,
    hasMultiCurrencyDonations,
    donorValueByOrg,
    totalTransactions,
    addTransaction
  }
}
