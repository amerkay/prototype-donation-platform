<script setup lang="ts">
import { computed } from 'vue'
import { useCurrencySettingsStore } from '~/features/settings/admin/stores/currencySettings'
import { CURRENCY_OPTIONS } from '~/features/donation-form/shared/composables/useCurrency'
import { Card, CardContent, CardFooter } from '~/components/ui/card'

const currencyStore = useCurrencySettingsStore()

const defaultCurrencyDisplay = computed(() => {
  const option = CURRENCY_OPTIONS.find((opt) => opt.value === currencyStore.defaultCurrency)
  return option?.label ?? currencyStore.defaultCurrency
})

const hasCurrencyOverrides = computed(() => {
  return currencyStore.supportedCurrencies.length > 1
})
</script>

<template>
  <Card class="gap-4 bg-muted/30 py-4 shadow-none">
    <CardContent class="space-y-2 text-sm px-4">
      <div>
        <span class="font-medium text-foreground">Default Currency:</span>
        <span class="text-muted-foreground ml-2">{{ defaultCurrencyDisplay }}</span>
      </div>
      <p class="text-muted-foreground">
        The charity information below applies to your default currency ({{
          currencyStore.defaultCurrency
        }}) transactions.
        <span v-if="hasCurrencyOverrides"
          >Use the currency-specific overrides section to provide different details for other
          currencies.</span
        >
      </p>
    </CardContent>
    <CardFooter class="justify-between border-t text-xs text-muted-foreground px-4 pt-4!">
      <span>Changes here affect all donor-facing pages and receipts.</span>
      <NuxtLink
        to="/admin/settings/currency"
        class="flex items-center gap-1 whitespace-nowrap text-primary hover:underline"
      >
        Currency Settings
        <Icon name="lucide:arrow-right" class="size-3" />
      </NuxtLink>
    </CardFooter>
  </Card>
</template>
