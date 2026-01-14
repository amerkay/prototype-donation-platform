<script setup lang="ts">
import { useCampaignConfigStore } from '~/stores/campaignConfig'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Edit, ExternalLink } from 'lucide-vue-next'

const store = useCampaignConfigStore()

const emit = defineEmits<{
  editForm: []
  preview: []
}>()

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
        <Badge
          v-if="store.isDirty"
          variant="outline"
          class="shrink-0 text-xs text-orange-600 border-orange-300"
        >
          Unsaved
        </Badge>
      </div>

      <!-- Center: Progress chip -->
      <div
        v-if="store.stats.goalAmount"
        class="flex items-center gap-3 px-3 py-1.5 bg-background rounded-full border"
      >
        <div class="w-24">
          <Progress :model-value="store.progressPercentage" class="h-2" />
        </div>
        <span class="text-sm font-medium whitespace-nowrap">
          {{ formatAmount(store.stats.totalRaised) }}
          <span class="text-muted-foreground font-normal">
            / {{ formatAmount(store.stats.goalAmount) }}
          </span>
        </span>
        <span
          v-if="store.stats.daysRemaining"
          class="text-xs text-muted-foreground whitespace-nowrap"
        >
          {{ store.stats.daysRemaining }}d left
        </span>
      </div>

      <!-- Right: Action buttons -->
      <div class="flex items-center gap-2 shrink-0">
        <Button variant="outline" size="sm" @click="emit('preview')">
          <ExternalLink class="w-4 h-4 mr-1.5" />
          Preview
        </Button>
        <Button size="sm" @click="emit('editForm')">
          <Edit class="w-4 h-4 mr-1.5" />
          Edit Form
        </Button>
      </div>
    </div>
  </div>
</template>
