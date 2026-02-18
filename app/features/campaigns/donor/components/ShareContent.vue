<script setup lang="ts">
import { useCampaignConfigStore } from '~/features/campaigns/shared/stores/campaignConfig'
import { useSocialSharingSettingsStore } from '~/features/settings/admin/stores/socialSharingSettings'
import { useCampaignShare } from '~/features/campaigns/shared/composables/useCampaignShare'
import CampaignPreviewCard from '~/features/campaigns/admin/components/CampaignPreviewCard.vue'
import SocialShareButtons from './SocialShareButtons.vue'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import { Copy, Check } from 'lucide-vue-next'
import type { Campaign } from '~/features/campaigns/shared/types'

const props = withDefaults(
  defineProps<{
    campaign?: Campaign
    /** Hide the copy-link section (used in ShareDialog where copy-link is already on the page) */
    hideCopyLink?: boolean
  }>(),
  { hideCopyLink: false }
)

// Campaign data for display (title, description, cover photo)
const configStore = useCampaignConfigStore()
const data = computed(() => props.campaign || configStore)

// Social sharing settings from org-level settings store
const sharingStore = useSocialSharingSettingsStore()
const sharingSettings = computed(() => ({
  facebook: sharingStore.facebook,
  twitter: sharingStore.twitter,
  linkedin: sharingStore.linkedin,
  whatsapp: sharingStore.whatsapp,
  email: sharingStore.email,
  copyLink: !props.hideCopyLink
}))

const { campaignUrl, copy, copied } = useCampaignShare(computed(() => data.value.id))

const hasOtherPlatforms = computed(() => {
  const s = sharingSettings.value
  return s.facebook || s.twitter || s.linkedin || s.whatsapp || s.email
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
    <div class="space-y-2">
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
            :settings="sharingSettings"
            :campaign-url="campaignUrl"
            :campaign-title="data.crowdfunding?.title || data.name"
            :short-description="data.crowdfunding?.shortDescription"
            show-labels
          />
        </div>
      </div>
    </template>

    <p v-if="!hasOtherPlatforms" class="text-sm text-muted-foreground text-center py-4">
      No sharing platforms have been enabled.
    </p>
  </div>
</template>
