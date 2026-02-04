import { useCampaigns } from '~/features/campaigns/shared/composables/useCampaigns'
import {
  transactions as sampleTransactions,
  subscriptions as sampleSubscriptions
} from '~/sample-api-responses/api-sample-response-transactions'
import type { Transaction, Subscription } from '~/features/donor-portal/types'
import type { Campaign } from '~/features/campaigns/shared/types'

const CURRENT_USER_EMAIL = 'awesome@charity.co.uk'

/**
 * Composable for the donor portal.
 * Provides transactions, subscriptions, current user's fundraisers, and computed stats.
 */
export function useDonorPortal() {
  const { campaigns } = useCampaigns()

  const transactions = ref<Transaction[]>(sampleTransactions)
  const subscriptions = ref<Subscription[]>(sampleSubscriptions)

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
    succeededTransactions.value.reduce((sum, t) => sum + t.subtotal * t.exchangeRate, 0)
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
    totalTransactions
  }
}
