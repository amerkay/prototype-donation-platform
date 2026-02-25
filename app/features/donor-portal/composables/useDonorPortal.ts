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
      if (campaign.type !== 'fundraiser') continue
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
    totalTransactions,
    addTransaction
  }
}
