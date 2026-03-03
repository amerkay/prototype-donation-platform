<script setup lang="ts">
import type { CampaignStats, MatchedGivingSettings } from '~/features/campaigns/shared/types'
import { useCampaignFormatters } from '~/features/campaigns/shared/composables/useCampaignFormatters'
import { getActivePeriod } from '~/features/campaigns/shared/utils/campaignCapabilities'
import { Progress } from '@/components/ui/progress'
import { Avatar, AvatarImage } from '@/components/ui/avatar'

const props = defineProps<{
  stats: CampaignStats
  goalAmount: number
  endDate?: string | null
  matchedGiving?: MatchedGivingSettings
  /** Compact mode for admin header chip */
  compact?: boolean
  /** Hide the supporters + time remaining footer (when host shows its own stats) */
  hideFooter?: boolean
}>()

const { formatAmount, formatTimeRemaining } = useCampaignFormatters()

// Find the currently active match period
const activePeriod = computed(() => {
  if (!props.matchedGiving?.periods?.length) return null
  return getActivePeriod(props.matchedGiving.periods)
})

const isMatched = computed(() => activePeriod.value != null)
const multiplier = computed(() => activePeriod.value?.matchMultiplier ?? 1)

const actualRaised = computed(() => props.stats.totalRaised)

// Total matched: sum of poolDrawn across all periods (actual match funds disbursed)
const totalPoolDrawn = computed(() =>
  (props.matchedGiving?.periods ?? []).reduce((sum, p) => sum + p.poolDrawn, 0)
)
const matchedTotal = computed(() => actualRaised.value + totalPoolDrawn.value)

// Progress percentage: for matched campaigns use total impact, otherwise raw raised
const progress = computed(() => {
  if (!props.goalAmount) return 0
  const effective = isMatched.value ? matchedTotal.value : actualRaised.value
  return Math.min(Math.round((effective / props.goalAmount) * 100), 100)
})

// Pool remaining for active period
const poolRemaining = computed(() => {
  if (!activePeriod.value) return 0
  return activePeriod.value.poolAmount - activePeriod.value.poolDrawn
})
</script>

<template>
  <div v-if="!compact" class="space-y-2">
    <!-- Matcher badge (above progress bar) — only when active period exists -->
    <div
      v-if="isMatched && activePeriod?.matcherName"
      class="flex items-center gap-3 rounded-lg bg-primary/5 border border-primary/15 px-3 py-2.5"
    >
      <Avatar v-if="activePeriod.matcherLogo" class="h-8 w-8 shrink-0">
        <AvatarImage :src="activePeriod.matcherLogo" />
      </Avatar>
      <div class="min-w-0 flex-1">
        <p class="text-sm font-semibold leading-tight truncate">
          Matched {{ multiplier }}x by {{ activePeriod.matcherName }}
        </p>
        <p
          v-if="activePeriod.displayMessage"
          class="text-xs text-muted-foreground leading-snug line-clamp-2 mt-0.5"
        >
          {{ activePeriod.displayMessage }}
        </p>
        <p class="text-xs text-muted-foreground/80 leading-tight mt-0.5">
          <span class="font-medium text-muted-foreground">
            {{ formatAmount(poolRemaining, stats.currency, 0) }}
          </span>
          of {{ formatAmount(activePeriod.poolAmount, stats.currency, 0) }} match remaining
        </p>
      </div>
      <span class="ml-auto shrink-0 text-lg font-bold text-primary">{{ multiplier }}x</span>
    </div>

    <!-- Progress bar (single bar for both standard and matched) -->
    <Progress :model-value="progress" class="h-3" />

    <!-- Matched: total impact headline + breakdown -->
    <template v-if="totalPoolDrawn > 0 || isMatched">
      <div class="flex justify-between items-baseline text-sm">
        <div>
          <span class="font-bold text-lg">
            {{ formatAmount(matchedTotal, stats.currency, 0) }}
          </span>
          <span class="text-muted-foreground"> total impact</span>
        </div>
        <div class="text-muted-foreground text-sm">
          {{ formatAmount(goalAmount, stats.currency, 0) }} goal
        </div>
      </div>
      <div class="text-[11px] text-muted-foreground">
        {{ formatAmount(actualRaised, stats.currency, 0) }} donated +
        {{ formatAmount(totalPoolDrawn, stats.currency, 0) }} matched
      </div>
    </template>

    <!-- Standard: simple raised / goal -->
    <template v-else>
      <div class="flex justify-between items-baseline text-sm">
        <div>
          <span class="font-bold text-lg">
            {{ formatAmount(actualRaised, stats.currency, 0) }}
          </span>
          <span class="text-muted-foreground"> raised</span>
        </div>
        <div class="text-muted-foreground text-sm">
          {{ formatAmount(goalAmount, stats.currency, 0) }} goal
        </div>
      </div>
    </template>

    <!-- Supporters + time remaining -->
    <div v-if="!hideFooter" class="flex justify-between text-xs text-muted-foreground">
      <span>{{ stats.totalDonors }} supporters</span>
      <span v-if="formatTimeRemaining(endDate)">{{ formatTimeRemaining(endDate) }} left</span>
    </div>
  </div>

  <!-- Compact mode: mini bar for CampaignHeader -->
  <div v-else class="flex items-center gap-3">
    <div class="w-14 sm:w-18 md:w-28">
      <Progress :model-value="progress" class="h-2" />
    </div>
    <slot />
  </div>
</template>
