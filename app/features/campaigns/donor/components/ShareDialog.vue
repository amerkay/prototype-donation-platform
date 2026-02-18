<script setup lang="ts">
import ShareContent from './ShareContent.vue'
import { useInjectedBrandingStyle } from '~/features/settings/admin/composables/useBrandingCssVars'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog'
import { Share2 } from 'lucide-vue-next'
import type { Campaign } from '~/features/campaigns/shared/types'

const props = defineProps<{
  open: boolean
  campaign?: Campaign
}>()

const emit = defineEmits<{
  'update:open': [value: boolean]
}>()

const brandingStyle = useInjectedBrandingStyle()
</script>

<template>
  <Dialog :open="props.open" @update:open="emit('update:open', $event)">
    <DialogContent class="sm:max-w-md" :style="brandingStyle">
      <DialogHeader>
        <DialogTitle class="flex items-center gap-2">
          <Share2 class="w-5 h-5" />
          Share this campaign
        </DialogTitle>
        <DialogDescription>
          Help spread the word by sharing with friends and family
        </DialogDescription>
      </DialogHeader>

      <div class="py-4">
        <ShareContent :campaign="campaign" hide-copy-link />
      </div>
    </DialogContent>
  </Dialog>
</template>
