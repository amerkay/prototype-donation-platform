<script setup lang="ts">
import { useCampaignShare } from '~/features/campaigns/shared/composables/useCampaignShare'
import CampaignPreviewCard from '~/features/campaigns/admin/components/CampaignPreviewCard.vue'
import SocialShareButtons from './SocialShareButtons.vue'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import { Copy, Check, Share2 } from 'lucide-vue-next'

const props = defineProps<{
  open: boolean
}>()

const emit = defineEmits<{
  'update:open': [value: boolean]
}>()

const { store, campaignUrl, copy, copied, hasOtherPlatforms } = useCampaignShare()
</script>

<template>
  <Dialog :open="props.open" @update:open="emit('update:open', $event)">
    <DialogContent class="sm:max-w-md">
      <DialogHeader>
        <DialogTitle class="flex items-center gap-2">
          <Share2 class="w-5 h-5" />
          Share this campaign
        </DialogTitle>
        <DialogDescription>
          Help spread the word by sharing with friends and family
        </DialogDescription>
      </DialogHeader>

      <div class="space-y-4 py-4">
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
    </DialogContent>
  </Dialog>
</template>
