<script setup lang="ts">
import { useCampaignConfigStore } from '~/features/campaigns/shared/stores/campaignConfig'
import CrowdfundingPage from '~/features/campaigns/donor/components/CrowdfundingPage.vue'

const store = useCampaignConfigStore()
</script>

<template>
  <CrowdfundingPage v-if="store.fullCampaign" :campaign="store.fullCampaign" />
</template>
