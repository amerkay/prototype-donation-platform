<script setup lang="ts">
import PreviewLayout from '~/features/_admin/components/PreviewLayout.vue'
import CrowdfundingPagePreview from '~/features/campaigns/admin/components/CrowdfundingPagePreview.vue'
import { useCampaigns } from '~/features/campaigns/shared/composables/useCampaigns'
import { useCampaignConfigStore } from '~/features/campaigns/shared/stores/campaignConfig'

definePageMeta({
  layout: false
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

const backUrl = computed(() => `/admin/campaigns/${route.params.id}`)
</script>

<template>
  <PreviewLayout :back-url="backUrl">
    <CrowdfundingPagePreview v-if="campaign" />
    <div v-else class="text-center py-12">
      <p class="text-muted-foreground">Campaign not found</p>
    </div>
  </PreviewLayout>
</template>
