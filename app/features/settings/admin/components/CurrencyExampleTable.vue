<script setup lang="ts">
import { computed } from 'vue'
import { useCurrency } from '~/features/donation-form/shared/composables/useCurrency'
import { getExchangeRatesForBase } from '~/sample-api-responses/api-sample-response-exchange-rates'
import { useFormBuilderContext } from '~/features/_library/form-builder/composables/useFormBuilderContext'

interface Props {
  /** Target currency code (e.g., 'USD') */
  toCurrency: string
}

const props = defineProps<Props>()

// Reduced to 5 key amounts for compact display
const EXAMPLE_AMOUNTS = [5, 10, 15, 25, 50, 75, 100, 250, 500, 1000]

// Access form values directly for reactivity
const { formValues } = useFormBuilderContext()

// Get current form values reactively
const fromCurrency = computed(() => {
  const currencies = formValues.value?.currencies as Record<string, unknown> | undefined
  return (currencies?.defaultCurrency as string) || 'GBP'
})

// Initialize useCurrency with reactive base currency - multipliers handled automatically!
const { getCurrencySymbol, smartRound } = useCurrency(fromCurrency)

const fromSymbol = computed(() => getCurrencySymbol(fromCurrency.value))
const toSymbol = computed(() => getCurrencySymbol(props.toCurrency))

const exchangeRates = computed(() => getExchangeRatesForBase(fromCurrency.value))
const baseRate = computed(() => exchangeRates.value.rates[props.toCurrency] ?? 1)

const conversions = computed(() => {
  return EXAMPLE_AMOUNTS.map((amount) => {
    // Convert to target currency, then apply multiplier and smart rounding
    // Multiplier is now applied automatically by smartRound!
    const convertedAmount = amount * baseRate.value
    return {
      from: amount,
      to: smartRound(convertedAmount, props.toCurrency, fromCurrency.value)
    }
  })
})
</script>

<template>
  <div class="space-y-1.5">
    <p class="text-xs text-muted-foreground font-bold">Example smart conversions</p>

    <!-- Responsive grid: 2 columns on mobile, 3 on tablet, 5 on desktop -->
    <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-1.5">
      <div
        v-for="conversion in conversions"
        :key="conversion.from"
        class="grid grid-cols-3 items-center gap-1 px-2 py-1 rounded bg-muted/50 text-xs"
      >
        <span class="font-medium text-right">{{ fromSymbol }}{{ conversion.from }}</span>
        <Icon
          name="lucide:arrow-right"
          class="size-3 text-muted-foreground shrink-0 justify-self-center"
        />
        <span class="font-medium">{{ toSymbol }}{{ conversion.to }}</span>
      </div>
    </div>

    <p class="text-xs text-muted-foreground">
      Exchange rate: 1 {{ fromCurrency }} = {{ baseRate.toFixed(4) }}
      {{ toCurrency }}
    </p>
  </div>
</template>
