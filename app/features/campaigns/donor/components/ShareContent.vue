<script setup lang="ts">
import { useCampaignConfigStore } from '~/features/campaigns/shared/stores/campaignConfig'
import { useCampaignShare } from '~/features/campaigns/shared/composables/useCampaignShare'
import CampaignPreviewCard from '~/features/campaigns/admin/components/CampaignPreviewCard.vue'
import SocialShareButtons from './SocialShareButtons.vue'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import { Copy, Check } from 'lucide-vue-next'
import type { Campaign } from '~/features/campaigns/shared/types'

const props = defineProps<{
  campaign?: Campaign
}>()

// Use campaign prop if provided, otherwise fall back to store (for admin preview)
const configStore = useCampaignConfigStore()
const data = computed(() => props.campaign || configStore)

const { campaignUrl, copy, copied } = useCampaignShare(computed(() => data.value.id))

const hasOtherPlatforms = computed(() => {
  const sharing = data.value.socialSharing
  if (!sharing) return false
  return (
    sharing.facebook || sharing.twitter || sharing.linkedin || sharing.whatsapp || sharing.email
  )
})
</script>

<template>
  <div class="space-y-4">
    <!-- Campaign Preview Card -->
    <CampaignPreviewCard
      :title="data.crowdfunding?.title || data.name"
      :description="data.crowdfunding?.shortDescription"
      :cover-photo="data.crowdfunding?.coverPhoto"
      compact
    />

    <!-- Copy Link -->
    <div v-if="data.socialSharing?.copyLink" class="space-y-2">
      <p class="text-sm font-medium">Campaign link</p>
      <div class="flex gap-2">
        <Input :model-value="campaignUrl" readonly class="font-mono text-xs" />
        <Button variant="outline" @click="copy()">
          <Check v-if="copied" class="w-4 h-4" />
          <Copy v-else class="w-4 h-4" />
        </Button>
      </div>
    </div>

    <template v-if="hasOtherPlatforms">
      <Separator />

      <!-- Social Buttons -->
      <div class="space-y-2">
        <p class="text-sm font-medium">Share on</p>
        <div class="grid grid-cols-2 gap-2">
          <SocialShareButtons
            :settings="data.socialSharing"
            :campaign-url="campaignUrl"
            :campaign-title="data.crowdfunding?.title || data.name"
            :short-description="data.crowdfunding?.shortDescription"
            show-labels
          />
        </div>
      </div>
    </template>

    <p
      v-if="!hasOtherPlatforms && !data.socialSharing?.copyLink"
      class="text-sm text-muted-foreground text-center py-4"
    >
      No sharing options have been enabled for this campaign.
    </p>
  </div>
</template>
