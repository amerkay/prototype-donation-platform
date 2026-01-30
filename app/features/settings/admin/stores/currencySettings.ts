import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { CurrencySettings } from '~/features/settings/admin/types'
import { currencySettings } from '~/sample-api-responses/api-sample-response-settings'
import { useEditableState } from '~/features/_admin/composables/defineEditableStore'

/**
 * Organization-level currency settings store
 *
 * Provides default currency configuration used across all forms.
 * Individual forms can override these settings if needed (e.g., regional campaigns).
 *
 * @example
 * ```vue
 * <script setup>
 * const currencySettings = useCurrencySettingsStore()
 * const formConfig = useFormConfigStore()
 *
 * // Use form override if available, otherwise global default
 * const currencies = formConfig.fullConfig?.localization ?? currencySettings
 * </script>
 * ```
 */
export const useCurrencySettingsStore = defineStore('currencySettings', () => {
  // Editable state management
  const { isDirty, isSaving, markDirty, markClean } = useEditableState()

  // State
  const supportedCurrencies = ref<string[]>([...currencySettings.supportedCurrencies])
  const defaultCurrency = ref<string>(currencySettings.defaultCurrency)
  const currencyMultipliers = ref<Record<string, number>>({
    ...currencySettings.currencyMultipliers
  })

  // Getters
  const isCurrencySupported = computed(() => (currency: string): boolean => {
    return supportedCurrencies.value.includes(currency)
  })

  const getMultiplier = computed(() => (currency: string): number => {
    return currencyMultipliers.value[currency] ?? 1.0
  })

  // Actions
  function initialize(settings: CurrencySettings) {
    supportedCurrencies.value = settings.supportedCurrencies
    defaultCurrency.value = settings.defaultCurrency
    currencyMultipliers.value = { ...settings.currencyMultipliers }
    markClean()
  }

  function updateSettings(settings: Partial<CurrencySettings>) {
    if (settings.supportedCurrencies !== undefined) {
      supportedCurrencies.value = settings.supportedCurrencies
    }
    if (settings.defaultCurrency !== undefined) {
      defaultCurrency.value = settings.defaultCurrency
    }
    if (settings.currencyMultipliers !== undefined) {
      currencyMultipliers.value = { ...settings.currencyMultipliers }
    }
    markDirty()
  }

  return {
    // State
    supportedCurrencies,
    defaultCurrency,
    currencyMultipliers,
    isDirty,
    isSaving,
    // Getters
    isCurrencySupported,
    getMultiplier,
    // Actions
    initialize,
    updateSettings,
    markDirty,
    markClean
  }
})
