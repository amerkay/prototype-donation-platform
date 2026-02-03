import { useCampaigns } from '~/features/campaigns/shared/composables/useCampaigns'
import type { Campaign } from '~/features/campaigns/shared/types'

/**
 * Feature flags for the admin interface
 * Determines which features should be visible to the current user
 */
export function useFeatureFlags() {
  const { campaigns } = useCampaigns()

  // Check if current user (Wild Amer / awesome@charity.co.uk) has any fundraiser campaigns
  const showMyFundraisers = computed(() => {
    const currentUserEmail = 'awesome@charity.co.uk'
    return campaigns.value.some((campaign) => {
      if (campaign.type !== 'fundraiser') return false
      // Check if this fundraiser belongs to current user
      // We can check via the parent template's fundraisers array
      const parentTemplate = campaigns.value.find((c) => c.id === campaign.parentCampaignId)
      if (!parentTemplate) return false
      return parentTemplate.fundraisers.some(
        (f) => f.email === currentUserEmail && f.campaignId === campaign.id
      )
    })
  })

  // Get fundraiser campaigns for current user
  const currentUserFundraisers = computed(() => {
    const currentUserEmail = 'awesome@charity.co.uk'
    const fundraiserCampaigns: Campaign[] = []

    for (const campaign of campaigns.value) {
      if (campaign.type !== 'fundraiser') continue

      // Find parent template to get fundraiser metadata
      const parentTemplate = campaigns.value.find((c) => c.id === campaign.parentCampaignId)
      if (!parentTemplate) continue

      // Check if this fundraiser belongs to current user
      const fundraiserMeta = parentTemplate.fundraisers.find(
        (f) => f.campaignId === campaign.id && f.email === currentUserEmail
      )

      if (fundraiserMeta) {
        fundraiserCampaigns.push(campaign)
      }
    }

    return fundraiserCampaigns
  })

  return {
    showMyFundraisers,
    currentUserFundraisers
  }
}
