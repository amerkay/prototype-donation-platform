<script setup lang="ts">
import type { CampaignStats } from '~/features/campaigns/shared/types'
import { useCampaignFormatters } from '~/features/campaigns/shared/composables/useCampaignFormatters'
import { Progress } from '@/components/ui/progress'

const props = defineProps<{
  stats: CampaignStats
  goalAmount: number
}>()

const { formatAmount } = useCampaignFormatters()

const progressPercentage = computed(() => {
  if (!props.goalAmount || !props.stats) return 0
  return Math.min(Math.round((props.stats.totalRaised / props.goalAmount) * 100), 100)
})
</script>

<template>
  <div class="space-y-2">
    <Progress :model-value="progressPercentage" class="h-3" />
    <div class="flex justify-between items-baseline text-sm">
      <div>
        <span class="font-bold text-lg">{{
          formatAmount(stats.totalRaised, stats.currency, 0)
        }}</span>
        <span class="text-muted-foreground"> raised</span>
      </div>
      <div class="text-muted-foreground text-right text-sm">
        <span>{{ formatAmount(goalAmount, stats.currency, 0) }} goal</span>
      </div>
    </div>
    <!-- <Separator /> -->
    <div class="flex justify-between text-xs text-muted-foreground">
      <span>{{ stats.totalDonors }} supporters</span>
      <span v-if="stats.daysRemaining">{{ stats.daysRemaining }} days left</span>
    </div>
  </div>
</template>
