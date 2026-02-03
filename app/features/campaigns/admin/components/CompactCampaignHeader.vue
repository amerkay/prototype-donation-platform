<script setup lang="ts">
import { useCampaignConfigStore } from '~/features/campaigns/shared/stores/campaignConfig'
import {
  getCampaignTypeShortLabel,
  getCampaignTypeBadgeVariant
} from '~/features/campaigns/shared/composables/useCampaignTypes'
import {
  useCampaignFormatters,
  CAMPAIGN_STATUS_COLORS
} from '~/features/campaigns/shared/composables/useCampaignFormatters'
import type { CampaignStatus } from '~/features/campaigns/shared/types'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'

const store = useCampaignConfigStore()
const { formatAmount } = useCampaignFormatters()

const campaignTypeLabel = computed(() => getCampaignTypeShortLabel({ type: store.type }))
const typeBadgeVariant = computed(() => getCampaignTypeBadgeVariant(store.type))
const statusColors = computed(() => CAMPAIGN_STATUS_COLORS[store.status])

// P2P templates show total raised only (no progress bar, as each fundraiser has own goal)
const showProgress = computed(() => !store.isP2P && store.crowdfunding?.goalAmount)

const STATUS_OPTIONS: { value: CampaignStatus; label: string }[] = [
  { value: 'draft', label: 'Draft' },
  { value: 'active', label: 'Active' },
  { value: 'paused', label: 'Paused' },
  { value: 'completed', label: 'Completed' },
  { value: 'archived', label: 'Archived' }
]

function handleStatusChange(value: string | number | bigint | Record<string, unknown> | null) {
  if (typeof value === 'string') {
    store.status = value as CampaignStatus
    store.markDirty()
  }
}
</script>

<template>
  <div v-if="store.stats" class="bg-muted/30 rounded-xl border px-4 py-3">
    <div class="flex items-center justify-between gap-4 flex-wrap">
      <!-- Left: Campaign name, type and status -->
      <div class="flex items-center gap-3 min-w-0">
        <h1 class="text-lg font-bold truncate">{{ store.name }}</h1>
        <Badge :variant="typeBadgeVariant" class="shrink-0 text-xs">
          {{ campaignTypeLabel }}
        </Badge>

        <!-- Status dropdown (all campaign types) -->
        <Select :model-value="store.status" @update:model-value="handleStatusChange">
          <SelectTrigger
            :class="[
              'data-[size=default]:h-6 w-auto gap-1 rounded-full px-2 py-0 text-xs font-medium shadow-none',
              statusColors.trigger
            ]"
          >
            <span :class="['size-1.5 shrink-0 rounded-full', statusColors.dot]" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem
              v-for="opt in STATUS_OPTIONS"
              :key="opt.value"
              :value="opt.value"
              class="text-xs"
            >
              <span class="flex items-center gap-2">
                <span
                  :class="['size-1.5 shrink-0 rounded-full', CAMPAIGN_STATUS_COLORS[opt.value].dot]"
                />
                {{ opt.label }}
              </span>
            </SelectItem>
          </SelectContent>
        </Select>
      </div>

      <!-- Center: Total raised only (for P2P templates) -->
      <div
        v-if="store.isP2P"
        class="flex items-center gap-3 px-3 py-1.5 bg-background rounded-full border"
      >
        <span class="text-xs text-muted-foreground whitespace-nowrap">Total Raised</span>
        <span class="text-sm font-medium whitespace-nowrap">
          {{ formatAmount(store.stats.totalRaised) }}
        </span>
      </div>

      <!-- Center: Progress chip (for standard campaigns and fundraisers with goals) -->
      <div
        v-else-if="showProgress"
        class="flex items-center gap-3 px-3 py-1.5 bg-background rounded-full border"
      >
        <div class="w-24">
          <Progress :model-value="store.progressPercentage" class="h-2" />
        </div>
        <span class="text-sm font-medium whitespace-nowrap">
          {{ formatAmount(store.stats.totalRaised) }}
          <span class="text-muted-foreground font-normal">
            / {{ formatAmount(store.crowdfunding?.goalAmount ?? 0) }}
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
