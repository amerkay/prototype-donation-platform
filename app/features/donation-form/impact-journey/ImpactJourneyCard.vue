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

// Get impact items provided at this donation level
const { providedItems, showUpsell, upsellMessage, upsellTargetAmount, targetRecurringFrequency } =
  useImpactJourneyMessages(
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
  <div v-if="providedItems.length > 0" class="border-t pt-4 space-y-3">
    <!-- Impact Items Checklist -->
    <div class="rounded-lg border bg-card p-4 space-y-3">
      <!-- Frequency-aware heading -->
      <h4 class="font-semibold text-sm">
        <template v-if="frequency === 'once'">Your donation provides:</template>
        <template v-else-if="frequency === 'monthly'">Your monthly donation provides:</template>
        <template v-else-if="frequency === 'yearly'">Your yearly donation provides:</template>
        <template v-else>Your donation provides:</template>
      </h4>

      <!-- Auto-generated list of all items up to this amount -->
      <ul class="space-y-2">
        <li
          v-for="item in providedItems"
          :key="item.amount"
          class="flex items-start gap-2 text-sm text-muted-foreground"
        >
          <span class="text-primary mt-0.5">✓</span>
          <span>{{ item.label }}</span>
        </li>
      </ul>

      <!-- Frequency context summary -->
      <p v-if="frequency === 'monthly'" class="text-sm text-foreground font-medium pt-2 border-t">
        These benefits repeat every month for as long as you give.
      </p>
      <p v-if="frequency === 'yearly'" class="text-sm text-foreground font-medium pt-2 border-t">
        These benefits continue all year (12 months of ongoing impact).
      </p>

      <!-- Thank you message -->
      <p
        class="text-sm text-foreground font-medium"
        :class="{ 'pt-2 border-t': frequency === 'once' }"
      >
        Thank you for making this impact possible.
      </p>
    </div>

    <!-- Optional Upsell CTA -->
    <div v-if="showUpsell && upsellMessage" class="rounded-lg border bg-muted/50 p-4 space-y-3">
      <p class="text-sm text-muted-foreground">{{ upsellMessage }}</p>
      <Button variant="outline" size="sm" class="w-full" @click="handleUpsellClick">
        <template v-if="frequency === 'once'"> Switch to Recurring → </template>
        <template v-else-if="upsellTargetAmount">
          Increase to {{ currency }}{{ upsellTargetAmount }} →
        </template>
        <template v-else> Increase My Impact → </template>
      </Button>
    </div>
  </div>
</template>
