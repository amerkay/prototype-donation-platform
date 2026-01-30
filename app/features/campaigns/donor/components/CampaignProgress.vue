<script setup lang="ts">
import type { CampaignStats } from '~/features/campaigns/shared/types'
import { useCampaignFormatters } from '~/features/campaigns/shared/composables/useCampaignFormatters'
import { Card, CardContent } from '@/components/ui/card'
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
  <Card class="@3xl:py-5">
    <CardContent class="space-y-2 @3xl:px-5">
      <Progress :model-value="progressPercentage" class="h-3" />
      <div class="flex justify-between items-baseline text-sm">
        <div>
          <span class="font-bold text-lg">{{ formatAmount(stats.totalRaised) }}</span>
          <span class="text-muted-foreground"> raised</span>
        </div>
        <div class="text-muted-foreground text-right text-sm">
          <span>{{ formatAmount(goalAmount) }} goal</span>
        </div>
      </div>
      <div class="flex justify-between text-xs text-muted-foreground">
        <span>{{ stats.totalDonors }} supporters</span>
        <span v-if="stats.daysRemaining">{{ stats.daysRemaining }} days left</span>
      </div>
    </CardContent>
  </Card>
</template>
