<script setup lang="ts">
import { computed, toRef } from 'vue'
import { Button } from '@/components/ui/button'
import { useImpactJourneyMessages } from './composables/useImpactJourneyMessages'
import type { ImpactJourneySettings } from './types'

interface Props {
  frequency: 'once' | 'monthly' | 'yearly' | 'multiple'
  donationAmount: number // Current tab's donation amount
  currency: string // Selected currency
  baseCurrency: string // For threshold conversion
  config: ImpactJourneySettings // From formConfig
  enabledFrequencies: Array<'once' | 'monthly' | 'yearly'>
}

const props = defineProps<Props>()

const emit = defineEmits<{
  'switch-to-tab': [tab: 'monthly' | 'yearly']
}>()

// Convert props to refs for composable
const frequencyRef = toRef(props, 'frequency')
const amountRef = toRef(props, 'donationAmount')
const currencyRef = toRef(props, 'currency')
const configRef = toRef(props, 'config')

// Get current message based on threshold matching
const { currentMessage } = useImpactJourneyMessages(
  frequencyRef,
  amountRef,
  currencyRef,
  props.baseCurrency,
  configRef
)

// Determine CTA action from message
const ctaAction = computed<'monthly' | 'yearly'>(() => {
  if (!currentMessage.value?.cta) return 'monthly'
  return currentMessage.value.cta.action === 'switch-yearly' ? 'yearly' : 'monthly'
})

const handleCtaClick = () => {
  if (currentMessage.value?.cta) {
    emit('switch-to-tab', ctaAction.value)
  }
}
</script>

<template>
  <div v-if="currentMessage" class="border-t pt-4 space-y-3">
    <div class="rounded-lg border bg-card p-4 space-y-3">
      <h4 class="font-semibold text-sm">{{ currentMessage.title }}</h4>
      <p class="text-sm text-muted-foreground">{{ currentMessage.description }}</p>
      <Button
        v-if="currentMessage.cta"
        variant="outline"
        size="sm"
        class="w-full"
        @click="handleCtaClick"
      >
        {{ currentMessage.cta.text }}
      </Button>
    </div>
  </div>
</template>
