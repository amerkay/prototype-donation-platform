<script setup lang="ts">
import CrowdfundingPagePreview from '~/features/campaigns/donor/components/CrowdfundingPagePreview.vue'
import { useCampaigns } from '~/features/campaigns/shared/composables/useCampaigns'
import { useCampaignConfigStore } from '~/features/campaigns/shared/stores/campaignConfig'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Smartphone, Tablet, Monitor } from 'lucide-vue-next'

// Define page metadata
definePageMeta({
  layout: false
})

const route = useRoute()
const { getCampaignById } = useCampaigns()
const store = useCampaignConfigStore()

// Device preview mode
type DeviceMode = 'mobile' | 'tablet' | 'desktop'
const deviceMode = ref<DeviceMode>('mobile')

const deviceSizes = {
  mobile: 'max-w-[375px]',
  tablet: 'max-w-[768px]',
  desktop: 'max-w-[1024px]'
}

// Get campaign data
const campaign = computed(() => getCampaignById(route.params.id as string))

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

const goBack = () => {
  window.close()
  // Fallback if window.close doesn't work (not opened by script)
  navigateTo(`/campaigns/${route.params.id}`)
}
</script>

<template>
  <div class="min-h-screen bg-muted/30">
    <!-- Preview Banner -->
    <div class="sticky top-0 z-50 bg-background border-b">
      <div class="px-4 py-2 flex items-center justify-between gap-4">
        <div class="flex items-center gap-2">
          <Button variant="ghost" size="sm" @click="goBack">
            <ArrowLeft class="w-4 h-4 mr-1" />
            Back to Admin
          </Button>
        </div>

        <!-- Device Mode Switcher -->
        <div class="flex items-center gap-1 border rounded-md p-1 bg-muted/50">
          <Button
            variant="ghost"
            size="sm"
            :class="{ 'bg-background shadow-sm': deviceMode === 'mobile' }"
            @click="deviceMode = 'mobile'"
          >
            <Smartphone class="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            :class="{ 'bg-background shadow-sm': deviceMode === 'tablet' }"
            @click="deviceMode = 'tablet'"
          >
            <Tablet class="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            :class="{ 'bg-background shadow-sm': deviceMode === 'desktop' }"
            @click="deviceMode = 'desktop'"
          >
            <Monitor class="w-4 h-4" />
          </Button>
        </div>

        <div class="text-xs text-muted-foreground px-2 py-1 bg-muted rounded">Preview Mode</div>
      </div>
    </div>

    <!-- Campaign Preview -->
    <div class="py-6 px-4 flex justify-center relative">
      <div :class="[deviceSizes[deviceMode], 'w-full transition-all duration-300 ease-in-out']">
        <CrowdfundingPagePreview v-if="campaign" />

        <!-- Not Found State -->
        <div v-else class="text-center py-12">
          <p class="text-muted-foreground mb-4">Campaign not found</p>
          <Button variant="outline" as="a" href="/campaigns">
            <ArrowLeft class="w-4 h-4 mr-2" />
            Back to Campaigns
          </Button>
        </div>
      </div>

      <!-- Mobile Fixed Bottom CTA (only in preview mode) -->
      <div
        v-if="campaign && deviceMode !== 'desktop'"
        class="fixed bottom-0 left-0 right-0 bg-background border-t p-3 shadow-lg z-40"
        :class="deviceMode === 'mobile' ? 'max-w-93.75' : 'max-w-3xl'"
        style="left: 50%; transform: translateX(-50%)"
      >
        <div class="flex gap-2">
          <Button class="flex-1" size="lg" disabled>
            <Heart class="w-4 h-4 mr-2" />
            Donate Now
          </Button>
          <Button variant="outline" size="lg" disabled>
            <Share2 class="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  </div>
</template>
