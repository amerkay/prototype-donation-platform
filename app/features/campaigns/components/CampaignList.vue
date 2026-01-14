<script setup lang="ts">
import type { Campaign } from '../types'
import CampaignCard from './CampaignCard.vue'

defineProps<{
  campaigns: Campaign[]
  compact?: boolean
}>()
</script>

<template>
  <div v-if="campaigns.length === 0" class="text-center py-12">
    <p class="text-muted-foreground">No campaigns found.</p>
  </div>

  <div
    v-else
    class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
    :class="{ 'lg:grid-cols-2': compact }"
  >
    <NuxtLink
      v-for="campaign in campaigns"
      :key="campaign.id"
      :to="`/campaigns/${campaign.id}`"
      class="block h-full"
    >
      <CampaignCard :campaign="campaign" :compact="compact" />
    </NuxtLink>
  </div>
</template>
