<script setup lang="ts">
import { useCampaignShare } from '~/features/campaigns/shared/composables/useCampaignShare'
import CampaignPreviewCard from '~/features/campaigns/admin/components/CampaignPreviewCard.vue'
import SocialShareButtons from './SocialShareButtons.vue'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import { Copy, Check } from 'lucide-vue-next'

const { store, campaignUrl, copy, copied, hasOtherPlatforms } = useCampaignShare()
</script>

<template>
  <div class="space-y-4">
    <!-- Campaign Preview Card -->
    <CampaignPreviewCard
      :title="store.crowdfunding?.title || store.name"
      :description="store.crowdfunding?.shortDescription"
      :cover-photo="store.crowdfunding?.coverPhoto"
      compact
    />

    <!-- Copy Link -->
    <div v-if="store.socialSharing?.copyLink" class="space-y-2">
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
            :settings="store.socialSharing"
            :campaign-id="store.id!"
            :campaign-title="store.crowdfunding?.title || store.name"
            :short-description="store.crowdfunding?.shortDescription"
            show-labels
          />
        </div>
      </div>
    </template>

    <p
      v-if="!hasOtherPlatforms && !store.socialSharing?.copyLink"
      class="text-sm text-muted-foreground text-center py-4"
    >
      No sharing options have been enabled for this campaign.
    </p>
  </div>
</template>
