<script setup lang="ts">
import { useCampaignConfigStore } from '~/features/campaigns/shared/stores/campaignConfig'
import CrowdfundingPage from '~/features/campaigns/donor/components/CrowdfundingPage.vue'
import type { Campaign } from '~/features/campaigns/shared/types'

const store = useCampaignConfigStore()

// For P2P templates, show preview with empty stats (not aggregate)
// This helps admins see how fundraiser pages will look with default goal
const campaignForPreview = computed<Campaign | null>(() => {
  if (!store.fullCampaign) return null

  // P2P templates should preview with zeroed stats
  if (store.isP2P) {
    return {
      ...store.fullCampaign,
      stats: {
        totalRaised: 0,
        totalDonations: 0,
        totalDonors: 0,
        averageDonation: 0,
        topDonation: 0,
        currency: 'GBP'
      },
      recentDonations: []
    }
  }

  return store.fullCampaign
})
</script>

<template>
  <CrowdfundingPage v-if="campaignForPreview" :campaign="campaignForPreview" />
</template>
