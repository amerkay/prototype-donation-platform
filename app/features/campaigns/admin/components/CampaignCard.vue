<script setup lang="ts">
import type { Campaign } from '~/features/campaigns/shared/types'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { Calendar, Users, TrendingUp, Target } from 'lucide-vue-next'

const props = defineProps<{
  campaign: Campaign
  compact?: boolean
}>()

const statusVariants: Record<
  Campaign['status'],
  'default' | 'secondary' | 'outline' | 'destructive'
> = {
  active: 'default',
  draft: 'secondary',
  paused: 'outline',
  completed: 'outline',
  archived: 'outline'
}

const progressPercentage = computed(() => {
  if (!props.campaign.crowdfunding.goalAmount) return 0
  return Math.min(
    (props.campaign.stats.totalRaised / props.campaign.crowdfunding.goalAmount) * 100,
    100
  )
})

const formattedAmount = (amount: number) => {
  return new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency: 'GBP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount)
}

const formattedDate = computed(() => {
  return new Intl.DateTimeFormat('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  }).format(new Date(props.campaign.updatedAt))
})
</script>

<template>
  <Card :class="cn('transition-all hover:shadow-md h-full', compact ? '' : '')">
    <CardHeader>
      <div class="flex items-start justify-between gap-2 min-w-0">
        <div class="flex-1 min-w-0 overflow-hidden">
          <CardTitle class="text-lg truncate">{{ campaign.name }}</CardTitle>
          <CardDescription v-if="!compact" class="flex items-center gap-2 mt-1">
            <Calendar class="w-3 h-3" />
            <span class="text-xs">Updated {{ formattedDate }}</span>
          </CardDescription>
        </div>
        <Badge :variant="statusVariants[campaign.status]" class="shrink-0 self-start">
          {{ campaign.status }}
        </Badge>
      </div>
    </CardHeader>

    <CardContent class="space-y-4">
      <!-- Progress Bar -->
      <div v-if="campaign.crowdfunding.goalAmount" class="space-y-2">
        <div class="flex items-baseline justify-between text-sm">
          <span class="font-semibold">{{ formattedAmount(campaign.stats.totalRaised) }}</span>
          <span class="text-muted-foreground text-xs">
            of {{ formattedAmount(campaign.crowdfunding.goalAmount) }}
          </span>
        </div>
        <Progress :model-value="progressPercentage" class="h-2" />
        <p v-if="!compact" class="text-xs text-muted-foreground">
          {{ Math.round(progressPercentage) }}% funded
        </p>
      </div>

      <!-- Stats Grid -->
      <div v-if="!compact" class="grid grid-cols-2 gap-3 pt-2">
        <div class="flex items-center gap-2 text-sm">
          <Users class="w-4 h-4 text-muted-foreground" />
          <div>
            <p class="font-medium">{{ campaign.stats.totalDonors }}</p>
            <p class="text-xs text-muted-foreground">Donors</p>
          </div>
        </div>
        <div class="flex items-center gap-2 text-sm">
          <TrendingUp class="w-4 h-4 text-muted-foreground" />
          <div>
            <p class="font-medium">{{ campaign.stats.totalDonations }}</p>
            <p class="text-xs text-muted-foreground">Donations</p>
          </div>
        </div>
      </div>

      <!-- Days Remaining Badge -->
      <div
        v-if="campaign.stats.daysRemaining && !compact"
        class="flex items-center gap-2 pt-2 border-t"
      >
        <Target class="w-4 h-4 text-muted-foreground" />
        <span class="text-sm text-muted-foreground">
          {{ campaign.stats.daysRemaining }} days remaining
        </span>
      </div>

      <!-- Actions -->
      <div v-if="!compact" class="pt-2">
        <Button variant="default" size="sm" class="w-full"> Edit Campaign </Button>
      </div>
    </CardContent>
  </Card>
</template>
