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

// TODO: Remove when switching to Supabase API
// Track if client-side hydration completed (sessionStorage is client-only)
const isHydrated = ref(false)

// TODO: Remove when switching to Supabase API
// Check for campaign existence after client-side hydration from sessionStorage
onMounted(() => {
  isHydrated.value = true
  if (!campaign.value) {
    navigateTo('/admin/campaigns')
    return
  }
  // Initialize store with campaign data
  store.initialize(campaign.value)
})

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
  <!-- TODO: Remove loading state when switching to Supabase API -->
  <div v-if="!isHydrated" class="flex items-center justify-center min-h-screen">
    <div class="text-muted-foreground">Loading...</div>
  </div>
  <CrowdfundingPagePreview v-else-if="campaign" />
  <div v-else class="text-center py-12">
    <p class="text-muted-foreground">Campaign not found</p>
  </div>
</template>
