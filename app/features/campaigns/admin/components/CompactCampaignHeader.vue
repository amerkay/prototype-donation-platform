<script setup lang="ts">
import { useCampaignConfigStore } from '~/features/campaigns/shared/stores/campaignConfig'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'

const store = useCampaignConfigStore()

// Status badge variants
const statusVariants: Record<string, 'default' | 'secondary' | 'outline' | 'destructive'> = {
  active: 'default',
  draft: 'secondary',
  paused: 'outline',
  completed: 'outline',
  archived: 'outline'
}

// Formatting helpers
const formatAmount = (amount: number) => {
  return new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency: 'GBP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount)
}
</script>

<template>
  <div v-if="store.stats" class="bg-muted/30 rounded-xl border px-4 py-3">
    <div class="flex items-center justify-between gap-4 flex-wrap">
      <!-- Left: Campaign name and status -->
      <div class="flex items-center gap-3 min-w-0">
        <h1 class="text-lg font-bold truncate">{{ store.name }}</h1>
        <Badge :variant="statusVariants[store.status]" class="shrink-0 text-xs capitalize">
          {{ store.status }}
        </Badge>
      </div>

      <!-- Center: Progress chip -->
      <div
        v-if="store.crowdfunding?.goalAmount"
        class="flex items-center gap-3 px-3 py-1.5 bg-background rounded-full border"
      >
        <div class="w-24">
          <Progress :model-value="store.progressPercentage" class="h-2" />
        </div>
        <span class="text-sm font-medium whitespace-nowrap">
          {{ formatAmount(store.stats.totalRaised) }}
          <span class="text-muted-foreground font-normal">
            / {{ formatAmount(store.crowdfunding.goalAmount) }}
          </span>
        </span>
        <span
          v-if="store.stats.daysRemaining"
          class="text-xs text-muted-foreground whitespace-nowrap"
        >
          {{ store.stats.daysRemaining }}d left
        </span>
      </div>
    </div>
  </div>
</template>
