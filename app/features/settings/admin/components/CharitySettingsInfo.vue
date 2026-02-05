<script setup lang="ts">
import { computed } from 'vue'
import { Info } from 'lucide-vue-next'
import { useCurrencySettingsStore } from '~/features/settings/admin/stores/currencySettings'
import { CURRENCY_OPTIONS } from '~/features/donation-form/shared/composables/useCurrency'
import { Alert, AlertDescription } from '~/components/ui/alert'

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
  <Alert variant="info">
    <Info class="size-4" />
    <AlertDescription>
      <p>
        Shown to donors paying in {{ defaultCurrencyDisplay }} (your default currency).
        <template v-if="hasCurrencyOverrides">
          For other currencies, use the overrides below.</template
        >
      </p>
      <NuxtLink
        to="/admin/settings/currency#defaultCurrency"
        class="inline-flex items-center gap-1 font-medium hover:underline"
      >
        Change default currency
        <Icon name="lucide:arrow-right" class="size-3" />
      </NuxtLink>
    </AlertDescription>
  </Alert>
</template>
