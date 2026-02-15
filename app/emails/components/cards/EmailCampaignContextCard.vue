<script setup lang="ts">
import EmailCardMediaStack from '~/emails/components/cards/layouts/EmailCardMediaStack.vue'

interface Props {
  campaignName?: string
  description: string
  imageUrl?: string
  campaignUrl?: string
}

defineProps<Props>()
</script>

<template>
  <EmailCardMediaStack
    :image-url="imageUrl"
    :image-alt="campaignName || 'Campaign image'"
    :image-max-width="320"
    :image-max-height="320"
    :link-url="campaignUrl"
  >
    <p v-if="campaignName" style="margin: 0; font-weight: 600">
      {{ campaignName }}
    </p>
    <p style="margin: 4px 0 0; opacity: 0.9">
      {{ description }}
    </p>
  </EmailCardMediaStack>
</template>
