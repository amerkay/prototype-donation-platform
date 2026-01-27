import { computed } from 'vue'
import type { LocalizationSettings } from '~/features/donation-form/shared/types'
import { useCurrencySettingsStore } from '~/features/settings/shared/stores/currencySettings'

/**
 * Composable to get effective currency settings for donation forms
 * Returns organization's supported currencies
 *
 * @example
 * ```vue
 * <script setup>
 * const { effectiveCurrencies } = useDonationCurrencies()
 * // Use effectiveCurrencies.supportedCurrencies
 * </script>
 * ```
 */
export function useDonationCurrencies() {
  const currencySettings = useCurrencySettingsStore()

  /**
   * Get effective currency settings from global organization settings
   */
  const effectiveCurrencies = computed<LocalizationSettings>(() => ({
    supportedCurrencies: currencySettings.supportedCurrencies
  }))

  return {
    effectiveCurrencies
  }
}
