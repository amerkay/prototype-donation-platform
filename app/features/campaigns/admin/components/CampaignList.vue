<script setup lang="ts">
import type { Campaign } from '~/features/campaigns/shared/types'
import { useCampaigns } from '~/features/campaigns/shared/composables/useCampaigns'
import CampaignCard from './CampaignCard.vue'

defineProps<{
  campaigns: Campaign[]
  compact?: boolean
}>()

const { deleteCampaign } = useCampaigns()

function handleDelete(id: string) {
  deleteCampaign(id)
}
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
    <CampaignCard
      v-for="campaign in campaigns"
      :key="campaign.id"
      :campaign="campaign"
      :compact="compact"
      @delete="handleDelete(campaign.id)"
    />
  </div>
</template>
