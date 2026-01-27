import { defineStore } from 'pinia'
import type { CurrencySettings } from '~/features/settings/shared/types'
import { currencySettings } from '~/sample-api-responses/api-sample-response-settings'

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
export const useCurrencySettingsStore = defineStore('currencySettings', {
  state: (): CurrencySettings & { isDirty: boolean; isSaving: boolean } => ({
    supportedCurrencies: [...currencySettings.supportedCurrencies],
    isDirty: false,
    isSaving: false
  }),

  getters: {
    /**
     * Check if a currency is supported
     */
    isCurrencySupported:
      (state) =>
      (currency: string): boolean => {
        return state.supportedCurrencies.includes(currency)
      }
  },

  actions: {
    /**
     * Initialize store from API response or saved settings
     */
    initialize(settings: CurrencySettings) {
      this.supportedCurrencies = settings.supportedCurrencies
      this.isDirty = false
      this.isSaving = false
    },

    /**
     * Update currency settings
     */
    updateSettings(settings: Partial<CurrencySettings>) {
      if (settings.supportedCurrencies !== undefined) {
        this.supportedCurrencies = settings.supportedCurrencies
      }
      this.markDirty()
    },

    /**
     * Mark store as having unsaved changes
     */
    markDirty() {
      this.isDirty = true
    },

    /**
     * Reset dirty flag after save
     */
    markClean() {
      this.isDirty = false
    }
  }
})
