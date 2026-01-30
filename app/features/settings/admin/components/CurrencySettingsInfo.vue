<script setup lang="ts">
import { computed } from 'vue'
import { useCurrencySettingsStore } from '~/features/settings/admin/stores/currencySettings'
import { CURRENCY_OPTIONS } from '~/features/donation-form/shared/composables/useCurrency'
import { Card, CardContent, CardFooter } from '~/components/ui/card'

const currencyStore = useCurrencySettingsStore()

const supportedCurrenciesDisplay = computed(() => {
  return currencyStore.supportedCurrencies
    .map((code) => {
      const option = CURRENCY_OPTIONS.find((opt) => opt.value === code)
      return option?.label ?? code
    })
    .join(', ')
})

const multipliersDisplay = computed(() => {
  const multipliers = currencyStore.currencyMultipliers
  const entries = Object.entries(multipliers)

  if (entries.length === 0) {
    return 'All at default (1.0×)'
  }

  return entries
    .map(([currency, value]) => {
      const multiplier = value.toFixed(2)
      return `${currency}: ${multiplier}×`
    })
    .join(', ')
})
</script>

<template>
  <Card class="gap-4 bg-muted/30 py-4 shadow-none">
    <CardContent class="space-y-2 text-sm px-4">
      <div>
        <span class="font-medium text-foreground">Supported Currencies:</span>
        <span class="text-muted-foreground ml-2">{{ supportedCurrenciesDisplay }}</span>
      </div>
      <div>
        <span class="font-medium text-foreground">Multipliers:</span>
        <span class="text-muted-foreground ml-2">{{ multipliersDisplay }}</span>
      </div>
    </CardContent>
    <CardFooter class="justify-between border-t text-xs text-muted-foreground px-4 pt-4!">
      <span> Your organization's default currency settings. They apply to all forms. </span>
      <NuxtLink
        to="/admin/settings/currency"
        class="flex items-center gap-1 whitespace-nowrap text-primary hover:underline"
      >
        Edit Settings
        <Icon name="lucide:arrow-right" class="size-3" />
      </NuxtLink>
    </CardFooter>
  </Card>
</template>
