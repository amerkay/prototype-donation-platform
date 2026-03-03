<script setup lang="ts">
import { useCampaignConfigStore } from '~/features/campaigns/shared/stores/campaignConfig'
import { useCurrencySettingsStore } from '~/features/settings/admin/stores/currencySettings'
import CrowdfundingPage from '~/features/campaigns/features/crowdfunding/donor/components/CrowdfundingPage.vue'
import PreviewEditable from '~/features/_admin/components/PreviewEditable.vue'
import type { Campaign, MatchPeriod } from '~/features/campaigns/shared/types'

withDefaults(defineProps<{ editable?: boolean }>(), { editable: false })

const store = useCampaignConfigStore()
const currencyStore = useCurrencySettingsStore()

// For P2P templates, show preview with empty stats (not aggregate)
// This helps admins see how fundraiser pages will look with default goal
const campaignForPreview = computed<Campaign | null>(() => {
  if (!store.fullCampaign) return null

  // P2P templates: zero stats + donations but preserve matchedGiving (with zeroed poolDrawn)
  // Fundraisers inherit parent's match config, so the preview should show the match banner
  if (store.isP2P) {
    return {
      ...store.fullCampaign,
      stats: {
        totalRaised: 0,
        totalMatched: 0,
        totalDonations: 0,
        totalDonors: 0,
        averageDonation: 0,
        topDonation: 0,
        currency: store.currency || currencyStore.defaultCurrency
      },
      matchedGiving: {
        periods: (store.fullCampaign.matchedGiving?.periods ?? []).map((p: MatchPeriod) => ({
          ...p,
          poolDrawn: 0
        }))
      },
      recentDonations: []
    }
  }

  return store.fullCampaign
})
</script>

<template>
  <PreviewEditable v-if="campaignForPreview" :enabled="editable">
    <CrowdfundingPage :campaign="campaignForPreview" />
  </PreviewEditable>
</template>
