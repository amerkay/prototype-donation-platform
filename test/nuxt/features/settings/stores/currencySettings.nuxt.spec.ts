import { describe, it, expect, beforeEach } from 'vitest'
import { computed } from 'vue'
import { setActivePinia, createPinia } from 'pinia'
import { useCurrencySettingsStore } from '~/features/settings/admin/stores/currencySettings'
import {
  currencyOpenAccordionId,
  useCurrencySettingsForm
} from '~/features/settings/admin/forms/currency-settings-form'
import type { FieldGroupDef } from '~/features/_library/form-builder/types'

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

  describe('ensureMultiplierEntries', () => {
    it('auto-populates missing multiplier entries for supported non-default currencies on initialize', () => {
      const store = useCurrencySettingsStore()
      store.initialize({
        supportedCurrencies: ['GBP', 'USD', 'AUD'],
        defaultCurrency: 'GBP',
        currencyMultipliers: { USD: 2.0 }
      })

      // AUD was missing — should be auto-populated with 1.0
      expect(store.currencyMultipliers).toEqual({ USD: 2.0, AUD: 1.0 })
      // Should still be clean (ensureMultiplierEntries is part of initialize)
      expect(store.isDirty).toBe(false)
    })

    it('auto-populates when supportedCurrencies is updated via ref (setData path)', () => {
      const store = useCurrencySettingsStore()
      store.initialize({
        supportedCurrencies: ['GBP', 'USD'],
        defaultCurrency: 'GBP',
        currencyMultipliers: { USD: 1.5 }
      })

      // Simulate setData writing directly to the ref (as storeMapping does)
      store.supportedCurrencies = ['GBP', 'USD', 'CAD']

      // CAD should be auto-populated via the watch
      expect(store.currencyMultipliers.CAD).toBe(1.0)
      // USD should be untouched
      expect(store.currencyMultipliers.USD).toBe(1.5)
    })

    it('does not add multiplier entry for default currency', () => {
      const store = useCurrencySettingsStore()
      store.initialize({
        supportedCurrencies: ['GBP', 'USD'],
        defaultCurrency: 'GBP',
        currencyMultipliers: { USD: 1.0 }
      })

      expect(store.currencyMultipliers).toEqual({ USD: 1.0 })
      expect('GBP' in store.currencyMultipliers).toBe(false)
    })

    it('does not overwrite existing multiplier values', () => {
      const store = useCurrencySettingsStore()
      store.initialize({
        supportedCurrencies: ['GBP', 'USD', 'EUR'],
        defaultCurrency: 'GBP',
        currencyMultipliers: { USD: 2.0 }
      })

      // USD kept its value, EUR was auto-populated
      expect(store.currencyMultipliers.USD).toBe(2.0)
      expect(store.currencyMultipliers.EUR).toBe(1.0)
    })
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

describe('Currency accordion ↔ preview sync', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    currencyOpenAccordionId.value = undefined
  })

  it('onAccordionToggle sets currencyOpenAccordionId to currency code when opened', () => {
    const ctx = {
      values: computed(() => ({})),
      form: computed(() => ({})),
      title: undefined,
      description: undefined
    }
    const fields = useCurrencySettingsForm.setup(ctx)
    // Navigate into currencies → currencyTabs → multipliers tab to find currency groups
    const currencies = fields.currencies as FieldGroupDef
    const currencyTabs = currencies.fields.currencyTabs as {
      tabs: Array<{ value: string; fields: Record<string, unknown> }>
    }
    const multipliersTab = currencyTabs.tabs.find((t) => t.value === 'multipliers')!
    const usdGroup = multipliersTab.fields.USD as FieldGroupDef

    // Simulate accordion opening
    usdGroup.onAccordionToggle!('any-id', true)
    expect(currencyOpenAccordionId.value).toBe('USD')

    // Simulate accordion closing
    usdGroup.onAccordionToggle!('any-id', false)
    expect(currencyOpenAccordionId.value).toBeUndefined()
  })
})
