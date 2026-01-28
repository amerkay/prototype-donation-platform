<script setup lang="ts">
import { toRef } from 'vue'
import { Button } from '@/components/ui/button'
import { useImpactBoostMessages } from '~/features/donation-form/features/impact-boost/donor/composables/useImpactBoostMessages'
import type { ImpactBoostSettings } from '~/features/donation-form/features/impact-boost/admin/types'
import type { DonationAmountsSettings } from '~/features/donation-form/shared/types'

interface Props {
  frequency: 'once' | 'monthly' | 'yearly' | 'multiple'
  donationAmount: number // Current tab's donation amount
  currency: string // Selected currency
  baseCurrency: string // For amount conversion
  config: ImpactBoostSettings // From formConfig
  donationAmountsConfig: DonationAmountsSettings // For preset amounts
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
const donationAmountsConfigRef = toRef(props, 'donationAmountsConfig')

// Get upsell message and CTA
const {
  showUpsell,
  upsellType,
  upsellTargetAmount,
  targetRecurringFrequency,
  emotionalMessage,
  ctaCopy
} = useImpactBoostMessages(
  frequencyRef,
  amountRef,
  currencyRef,
  props.baseCurrency,
  configRef,
  donationAmountsConfigRef
)

// Handle upsell CTA click
const handleUpsellClick = () => {
  if (!showUpsell.value) return

  const freqKey = props.frequency

  // One-time to recurring conversion - use determined target frequency
  if (freqKey === 'once' && upsellType.value === 'recurring' && targetRecurringFrequency.value) {
    const targetAmount = upsellTargetAmount.value || props.donationAmount
    emit('switch-to-tab', targetRecurringFrequency.value, targetAmount)
  }
  // Increase amount on same tab - use next level amount
  else if (upsellType.value === 'increase' && upsellTargetAmount.value) {
    emit('update-amount', upsellTargetAmount.value)
  }
}
</script>

<template>
  <div v-if="showUpsell && frequency !== 'multiple'">
    <!-- Impact Boost Card: Simplified Emotional Appeal -->
    <div class="rounded-lg border bg-muted/30 p-5 space-y-4">
      <!-- Emotional Message -->
      <p class="text-sm leading-relaxed text-foreground font-medium">
        {{ emotionalMessage }}
      </p>

      <!-- Primary CTA Button -->
      <Button size="default" class="w-full" @click="handleUpsellClick">
        {{ ctaCopy }}
      </Button>
    </div>
  </div>
</template>
