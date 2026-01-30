import { describe, it, expect, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useCurrencySettingsStore } from '~/features/settings/admin/stores/currencySettings'

describe('Currency Settings Store', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('initializes with default values', () => {
    const store = useCurrencySettingsStore()

    expect(store.supportedCurrencies).toEqual(['GBP', 'USD', 'EUR'])
    expect(store.isDirty).toBe(false)
    expect(store.isSaving).toBe(false)
  })

  it('checks if currency is supported', () => {
    const store = useCurrencySettingsStore()

    expect(store.isCurrencySupported('USD')).toBe(true)
    expect(store.isCurrencySupported('EUR')).toBe(true)
    expect(store.isCurrencySupported('GBP')).toBe(true)
    expect(store.isCurrencySupported('JPY')).toBe(false)
  })

  it('initializes from settings', () => {
    const store = useCurrencySettingsStore()

    store.initialize({
      supportedCurrencies: ['USD', 'CAD'],
      defaultCurrency: 'USD',
      currencyMultipliers: {}
    })

    expect(store.supportedCurrencies).toEqual(['USD', 'CAD'])
    expect(store.isDirty).toBe(false)
  })

  it('updates settings and marks dirty', () => {
    const store = useCurrencySettingsStore()

    store.updateSettings({
      supportedCurrencies: ['EUR', 'GBP', 'CHF']
    })

    expect(store.supportedCurrencies).toEqual(['EUR', 'GBP', 'CHF'])
    expect(store.isDirty).toBe(true)
  })

  it('updates partial settings', () => {
    const store = useCurrencySettingsStore()

    // Update only supported currencies
    store.updateSettings({ supportedCurrencies: ['EUR', 'GBP'] })
    expect(store.supportedCurrencies).toEqual(['EUR', 'GBP'])
  })

  it('marks clean after save', () => {
    const store = useCurrencySettingsStore()

    store.updateSettings({ supportedCurrencies: ['USD', 'EUR'] })
    expect(store.isDirty).toBe(true)

    store.markClean()
    expect(store.isDirty).toBe(false)
  })

  it('marks dirty when settings change', () => {
    const store = useCurrencySettingsStore()

    expect(store.isDirty).toBe(false)

    store.markDirty()
    expect(store.isDirty).toBe(true)
  })
})
