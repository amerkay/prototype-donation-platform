<script setup lang="ts">
import type { SocialSharingSettings } from '~/features/settings/admin/stores/socialSharingSettings'
import SocialShareButtons from '~/features/campaigns/features/sharing/donor/components/SocialShareButtons.vue'

defineProps<{
  settings: (SocialSharingSettings & { copyLink: boolean }) | null
  campaignUrl: string
  campaignTitle: string
  shortDescription?: string
}>()

const emit = defineEmits<{ share: [platform: string] }>()
</script>

<template>
  <h3 class="font-semibold text-sm uppercase tracking-wide text-muted-foreground text-center">
    Share this campaign
  </h3>
  <div class="flex justify-center gap-2 flex-wrap">
    <SocialShareButtons
      :settings="settings"
      :campaign-url="campaignUrl"
      :campaign-title="campaignTitle"
      :short-description="shortDescription"
      size="icon"
      @share="emit('share', $event)"
    />
  </div>
</template>
