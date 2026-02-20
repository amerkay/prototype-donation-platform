<script setup lang="ts">
import { computed } from 'vue'
import {
  getCurrencySymbol,
  type ConversionBreakdown
} from '~/features/donation-form/shared/composables/useCurrency'

const props = defineProps<{
  breakdown: ConversionBreakdown
  fromCurrency: string
  toCurrency: string
}>()

const fromSymbol = computed(() => getCurrencySymbol(props.fromCurrency))
const toSymbol = computed(() => getCurrencySymbol(props.toCurrency))

const hasMultiplierEffect = computed(() => props.breakdown.multiplier !== 1)
</script>

<template>
  <div class="bg-muted rounded-md p-3 text-sm space-y-2.5">
    <p class="font-medium">How conversion works:</p>

    <!-- Step 1: Exchange rate -->
    <div class="flex items-start gap-2">
      <span
        class="bg-primary/10 text-primary rounded-full w-5 h-5 flex items-center justify-center text-xs font-medium shrink-0 mt-0.5"
        >1</span
      >
      <div>
        <p>
          <span class="font-medium">Exchange rate</span>: 1 {{ fromCurrency }} =
          {{ breakdown.exchangeRate.toFixed(4) }}
          {{ toCurrency }}
        </p>
        <p class="text-muted-foreground">
          {{ fromSymbol }}{{ breakdown.original }} × {{ breakdown.exchangeRate.toFixed(4) }} =
          {{ toSymbol }}{{ breakdown.afterExchange }}
        </p>
      </div>
    </div>

    <!-- Step 2: Multiplier (only shown if != 1) -->
    <div v-if="hasMultiplierEffect" class="flex items-start gap-2">
      <span
        class="bg-primary/10 text-primary rounded-full w-5 h-5 flex items-center justify-center text-xs font-medium shrink-0 mt-0.5"
        >2</span
      >
      <div>
        <p>
          <span class="font-medium">Org multiplier</span>: {{ breakdown.multiplier.toFixed(2) }}×
        </p>
        <p class="text-muted-foreground">
          {{ toSymbol }}{{ breakdown.afterExchange }} × {{ breakdown.multiplier.toFixed(2) }} =
          {{ toSymbol }}{{ breakdown.afterMultiplier }}
        </p>
        <p class="text-muted-foreground text-xs">
          Adjusts converted values up or down (set in currency settings)
        </p>
      </div>
    </div>

    <!-- Step 3: Smart rounding -->
    <div class="flex items-start gap-2">
      <span
        class="bg-primary/10 text-primary rounded-full w-5 h-5 flex items-center justify-center text-xs font-medium shrink-0 mt-0.5"
        >{{ hasMultiplierEffect ? 3 : 2 }}</span
      >
      <div>
        <p>
          <span class="font-medium">Smart rounding</span> to
          {{ breakdown.roundingBucket }}
        </p>
        <p class="text-muted-foreground">
          {{ toSymbol
          }}{{ hasMultiplierEffect ? breakdown.afterMultiplier : breakdown.afterExchange }} →
          <span class="font-medium text-foreground">{{ toSymbol }}{{ breakdown.final }}</span>
        </p>
        <p class="text-muted-foreground text-xs">
          Rounds to clean donor-friendly values based on amount size
        </p>
      </div>
    </div>
  </div>
</template>
