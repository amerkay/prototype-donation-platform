<script setup lang="ts">
import { Button } from '@/components/ui/button'
import { ICON_DONATION, ICON_SHARE } from '~/lib/icons'
import { CAMPAIGN_FIELD_TARGETS as CT } from '~/features/campaigns/admin/forms/campaign-config-master'

defineProps<{
  /** Show share button */
  showShare: boolean
}>()

const emit = defineEmits<{
  donate: []
  share: []
}>()
</script>

<template>
  <div class="flex gap-2 @3xl:flex-col">
    <Button
      class="flex-1 @3xl:flex-auto @3xl:w-full"
      size="lg"
      :data-field="CT.donationForm"
      @click="emit('donate')"
    >
      <ICON_DONATION class="w-4 h-4 mr-2" />
      Donate Now
    </Button>
    <Button
      v-if="showShare"
      variant="outline"
      class="@3xl:w-full"
      size="lg"
      :data-field="CT.crowdfunding.enableSocialSharing"
      @click="emit('share')"
    >
      <ICON_SHARE class="w-4 h-4 @3xl:mr-2" />
      <span class="sr-only @3xl:not-sr-only">Share Campaign</span>
    </Button>
  </div>
</template>
