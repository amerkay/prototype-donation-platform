import { describe, it, expect, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useDonationCurrencies } from '~/features/donation-form/shared/composables/useDonationCurrencies'
import { useCurrencySettingsStore } from '~/features/settings/admin/stores/currencySettings'

describe('useDonationCurrencies', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('returns global currency settings', () => {
    const currencySettings = useCurrencySettingsStore()

    // Initialize currency settings
    currencySettings.initialize({
      supportedCurrencies: ['USD', 'EUR', 'GBP'],
      defaultCurrency: 'USD',
      currencyMultipliers: {}
    })

    const { effectiveCurrencies } = useDonationCurrencies()

    expect(effectiveCurrencies.value.supportedCurrencies).toEqual(['USD', 'EUR', 'GBP'])
  })

  it('uses updated global currency settings', () => {
    const currencySettings = useCurrencySettingsStore()

    // Initialize with default settings
    currencySettings.initialize({
      supportedCurrencies: ['GBP', 'EUR'],
      defaultCurrency: 'GBP',
      currencyMultipliers: {}
    })

    const { effectiveCurrencies } = useDonationCurrencies()

    // Should use global settings
    expect(effectiveCurrencies.value.supportedCurrencies).toEqual(['GBP', 'EUR'])

    // Update global settings
    currencySettings.updateSettings({
      supportedCurrencies: ['EUR', 'USD']
    })

    // Should reflect updated global settings
    expect(effectiveCurrencies.value.supportedCurrencies).toEqual(['EUR', 'USD'])
  })
})
