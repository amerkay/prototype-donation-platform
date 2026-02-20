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

  it('getMultiplier returns configured value', () => {
    const store = useCurrencySettingsStore()
    store.initialize({
      supportedCurrencies: ['GBP', 'USD'],
      defaultCurrency: 'GBP',
      currencyMultipliers: { USD: 2.0 }
    })

    expect(store.getMultiplier('USD')).toBe(2.0)
  })

  it('getMultiplier returns 1.0 for unconfigured currency', () => {
    const store = useCurrencySettingsStore()
    expect(store.getMultiplier('JPY')).toBe(1.0)
  })

  it('toSnapshot returns plain object matching state', () => {
    const store = useCurrencySettingsStore()
    store.initialize({
      supportedCurrencies: ['GBP', 'EUR'],
      defaultCurrency: 'EUR',
      currencyMultipliers: { GBP: 0.86 }
    })

    const snapshot = store.toSnapshot()
    expect(snapshot).toEqual({
      supportedCurrencies: ['GBP', 'EUR'],
      defaultCurrency: 'EUR',
      currencyMultipliers: { GBP: 0.86 }
    })
    // Should be a plain copy, not the same reference
    expect(snapshot.supportedCurrencies).not.toBe(store.supportedCurrencies)
  })

  it('initialize resets multipliers', () => {
    const store = useCurrencySettingsStore()
    store.initialize({
      supportedCurrencies: ['USD'],
      defaultCurrency: 'USD',
      currencyMultipliers: { EUR: 0.92, GBP: 0.79 }
    })

    expect(store.getMultiplier('EUR')).toBe(0.92)
    expect(store.getMultiplier('GBP')).toBe(0.79)

    store.initialize({
      supportedCurrencies: ['GBP'],
      defaultCurrency: 'GBP',
      currencyMultipliers: {}
    })

    expect(store.getMultiplier('EUR')).toBe(1.0)
    expect(store.getMultiplier('GBP')).toBe(1.0)
  })
})
