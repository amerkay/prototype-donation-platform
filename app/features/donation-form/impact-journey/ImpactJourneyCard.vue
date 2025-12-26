<script setup lang="ts">
import { toRef } from 'vue'
import { Button } from '@/components/ui/button'
import { useImpactJourneyMessages } from './composables/useImpactJourneyMessages'
import type { ImpactJourneySettings } from './types'
import type { PricingSettings } from '~/features/donation-form/types'

interface Props {
  frequency: 'once' | 'monthly' | 'yearly' | 'multiple'
  donationAmount: number // Current tab's donation amount
  currency: string // Selected currency
  baseCurrency: string // For amount conversion
  config: ImpactJourneySettings // From formConfig
  pricingConfig: PricingSettings // For preset amounts
  enabledFrequencies: Array<'once' | 'monthly' | 'yearly'>
}

const props = defineProps<Props>()

const emit = defineEmits<{
  'switch-to-tab': [tab: 'monthly' | 'yearly', amount?: number]
  'update-amount': [amount: number]
}>()

// Convert props to refs for composable
const frequencyRef = toRef(props, 'frequency')
const amountRef = toRef(props, 'donationAmount')
const currencyRef = toRef(props, 'currency')
const configRef = toRef(props, 'config')
const pricingConfigRef = toRef(props, 'pricingConfig')

// Get impact items provided at this donation level + new design props
const {
  showUpsell,
  upsellTargetAmount,
  targetRecurringFrequency,
  timeFrameHeadline,
  multiplierText,
  impactListInline,
  impactListPrefix,
  ctaCopy
} = useImpactJourneyMessages(
  frequencyRef,
  amountRef,
  currencyRef,
  props.baseCurrency,
  configRef,
  pricingConfigRef
)

// Handle upsell CTA click
const handleUpsellClick = () => {
  if (!showUpsell.value) return

  const freqKey = props.frequency

  // One-time to recurring conversion - use determined target frequency
  if (freqKey === 'once' && targetRecurringFrequency.value) {
    const targetAmount = upsellTargetAmount.value || props.donationAmount
    emit('switch-to-tab', targetRecurringFrequency.value, targetAmount)
  }
  // Increase amount on same tab - use next level amount
  else if (upsellTargetAmount.value) {
    emit('update-amount', upsellTargetAmount.value)
  }
}
</script>

<template>
  <div v-if="impactListInline && frequency !== 'multiple'" class="border-t pt-4">
    <!-- Compact Impact Card: Multiplication Emphasis Design -->
    <div class="rounded-lg border bg-muted/30 p-5 space-y-4">
      <!-- Bold All-Caps Headline -->
      <h3 class="text-lg font-bold tracking-tight text-foreground">
        {{ timeFrameHeadline }}
      </h3>

      <!-- Compact Multiplier Subtitle -->
      <p class="text-sm text-muted-foreground leading-relaxed">
        {{ multiplierText }}
      </p>

      <!-- Inline Bullet Impact List -->
      <p class="text-sm text-foreground leading-relaxed">
        <span class="font-medium">{{ impactListPrefix }}</span>
        {{ impactListInline }}
      </p>

      <!-- Primary CTA Button (if upsell enabled) -->
      <Button v-if="showUpsell" size="default" class="w-full" @click="handleUpsellClick">
        {{ ctaCopy }}
      </Button>
    </div>
  </div>
</template>
