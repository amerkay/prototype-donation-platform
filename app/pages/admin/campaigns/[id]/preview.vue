<script setup lang="ts">
import CrowdfundingPagePreview from '~/features/campaigns/admin/components/CrowdfundingPagePreview.vue'
import { useCampaigns } from '~/features/campaigns/shared/composables/useCampaigns'
import { useCampaignConfigStore } from '~/features/campaigns/shared/stores/campaignConfig'

definePageMeta({
  layout: 'admin-preview'
})

const route = useRoute()
const { getCampaignById } = useCampaigns()
const store = useCampaignConfigStore()

const campaign = computed(() => getCampaignById(route.params.id as string))

// Redirect if campaign not found
if (!campaign.value) {
  navigateTo('/admin/campaigns')
}

// Initialize store with campaign data
if (campaign.value) {
  store.initialize(campaign.value)
}

// Watch for campaign ID changes
watch(
  () => route.params.id,
  (newId) => {
    const newCampaign = getCampaignById(newId as string)
    if (newCampaign) {
      store.initialize(newCampaign)
    }
  }
)
</script>

<template>
  <CrowdfundingPagePreview v-if="campaign" />
  <div v-else class="text-center py-12">
    <p class="text-muted-foreground">Campaign not found</p>
  </div>
</template>
