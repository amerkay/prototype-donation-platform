<script setup lang="ts">
import { useCampaignConfigStore } from '~/features/campaigns/shared/stores/campaignConfig'
import {
  getCampaignTypeLabel,
  getCampaignTypeBadgeVariant
} from '~/features/campaigns/shared/composables/useCampaignTypes'
import { Badge } from '@/components/ui/badge'

const store = useCampaignConfigStore()

const label = computed(() => getCampaignTypeLabel({ type: store.type }))
const variant = computed(() => getCampaignTypeBadgeVariant(store.type))
</script>

<template>
  <div class="flex items-center gap-2">
    <Badge :variant="variant">
      {{ label }}
    </Badge>
    <span class="text-xs text-muted-foreground"
      >Campaign type cannot be changed after creation</span
    >
  </div>
</template>
