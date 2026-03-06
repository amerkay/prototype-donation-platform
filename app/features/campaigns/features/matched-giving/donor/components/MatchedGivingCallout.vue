<script setup lang="ts">
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import type { MatchPeriod } from '~/features/campaigns/features/matched-giving/shared/types'

/**
 * Unified matched giving callout box.
 * Consistent visual identity across campaigns and donation forms:
 *   [Logo]  <slot: contextual text>  <#trailing slot: 2x pill or +amount>
 *
 * Variants:
 * - active (default): primary tint background
 * - historical: muted background for ended periods
 */
withDefaults(
  defineProps<{
    activePeriod: Pick<MatchPeriod, 'matcherName' | 'matcherLogo'> | null
    multiplier: number
    variant?: 'active' | 'historical'
  }>(),
  { variant: 'active' }
)
</script>

<template>
  <div
    class="flex items-center gap-3 rounded-lg px-3 py-2.5"
    :class="{
      'bg-primary/5 border border-primary/15': variant === 'active',
      'bg-muted/50 border border-muted': variant === 'historical'
    }"
  >
    <Avatar
      v-if="activePeriod?.matcherLogo"
      class="h-8 w-8 shrink-0"
      :class="{ 'opacity-70': variant === 'historical' }"
    >
      <AvatarImage :src="activePeriod.matcherLogo" />
      <AvatarFallback class="text-xs font-bold">{{ multiplier }}x</AvatarFallback>
    </Avatar>
    <Icon
      v-else
      name="lucide:handshake"
      class="h-5 w-5 shrink-0"
      :class="{
        'text-primary': variant === 'active',
        'text-muted-foreground': variant === 'historical'
      }"
    />
    <div class="min-w-0 flex-1">
      <slot />
    </div>
    <slot name="trailing">
      <span v-if="variant === 'active'" class="ml-auto shrink-0 text-xl font-bold text-primary">
        {{ multiplier }}x
      </span>
    </slot>
  </div>
</template>
