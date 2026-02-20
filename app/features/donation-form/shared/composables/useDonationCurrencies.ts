import { computed, type MaybeRef, toValue } from 'vue'
import type { LocalizationSettings } from '~/features/donation-form/shared/types'
import { useCurrencySettingsStore } from '~/features/settings/admin/stores/currencySettings'

/**
 * Composable to get effective currency settings for donation forms
 * Uses per-form enabledCurrencies when available, falls back to org settings
 *
 * @param formEnabledCurrencies - Optional per-form currency list override
 */
export function useDonationCurrencies(formEnabledCurrencies?: MaybeRef<string[] | undefined>) {
  const currencySettings = useCurrencySettingsStore()

  const effectiveCurrencies = computed<LocalizationSettings>(() => {
    const perForm = toValue(formEnabledCurrencies)
    return {
      supportedCurrencies: perForm?.length ? perForm : currencySettings.supportedCurrencies
    }
  })

  return {
    effectiveCurrencies
  }
}
