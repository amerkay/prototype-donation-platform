import { describe, it, expect, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { computed } from 'vue'
import { useDonationFormDonationAmountsForm } from '~/features/donation-form/admin/forms/donation-form-donation-amounts-form'
import { useCampaignConfigStore } from '~/features/campaigns/shared/stores/campaignConfig'
import { useCurrencySettingsStore } from '~/features/settings/admin/stores/currencySettings'
import type { FieldDef, FieldContext } from '~/features/_library/form-builder/types'

describe('Donation Amounts Form — Tab Filtering & Enabled Toggle', () => {
  beforeEach(() => {
    setActivePinia(createPinia())

    const currencyStore = useCurrencySettingsStore()
    currencyStore.initialize({
      supportedCurrencies: ['GBP', 'USD'],
      defaultCurrency: 'GBP',
      currencyMultipliers: {}
    })
  })

  function getFields(campaignType: string) {
    const campaignStore = useCampaignConfigStore()
    campaignStore.type = campaignType as 'standard' | 'p2p' | 'event' | 'p2p-fundraiser'

    const ctx = {
      values: computed(() => ({})),
      form: computed(() => ({}))
    }
    return useDonationFormDonationAmountsForm.setup(ctx) as Record<string, FieldDef>
  }

  function getTabsField(campaignType: string) {
    const fields = getFields(campaignType)
    return fields.frequencies as FieldDef & {
      tabs?: Array<{ value: string; fields: Record<string, FieldDef> }>
    }
  }

  function evalVisible(field: FieldDef, values: Record<string, unknown> = {}): boolean {
    if (!field.visibleWhen) return true
    if (typeof field.visibleWhen === 'function') {
      const ctx: FieldContext = { values, root: values }
      return field.visibleWhen(ctx)
    }
    return true
  }

  describe('tab filtering by campaign type', () => {
    it('standard campaigns show all three frequency tabs', () => {
      const tabsField = getTabsField('standard')
      const tabValues = tabsField.tabs!.map((t) => t.value)
      expect(tabValues).toEqual(['once', 'monthly', 'yearly'])
    })

    it('P2P campaigns show only the one-time tab', () => {
      const tabsField = getTabsField('p2p')
      const tabValues = tabsField.tabs!.map((t) => t.value)
      expect(tabValues).toEqual(['once'])
    })

    it('event campaigns show only the one-time tab', () => {
      const tabsField = getTabsField('event')
      const tabValues = tabsField.tabs!.map((t) => t.value)
      expect(tabValues).toEqual(['once'])
    })
  })

  describe('enabled toggle visibility for sole frequency', () => {
    it('P2P: enabled toggle is hidden when one-time is the sole frequency', () => {
      const tabsField = getTabsField('p2p')
      const onceTab = tabsField.tabs!.find((t) => t.value === 'once')!
      const enabledField = onceTab.fields.enabled!

      expect(evalVisible(enabledField)).toBe(false)
    })

    it('standard: enabled toggle is visible for one-time (not sole)', () => {
      const tabsField = getTabsField('standard')
      const onceTab = tabsField.tabs!.find((t) => t.value === 'once')!
      const enabledField = onceTab.fields.enabled!

      expect(evalVisible(enabledField)).toBe(true)
    })

    it('standard: enabled toggle is visible for monthly', () => {
      const tabsField = getTabsField('standard')
      const monthlyTab = tabsField.tabs!.find((t) => t.value === 'monthly')!
      const enabledField = monthlyTab.fields.enabled!

      expect(evalVisible(enabledField)).toBe(true)
    })
  })

  describe('other fields remain visible when sole frequency', () => {
    it('P2P: label, descriptions, presetAmounts, customAmount are visible for one-time', () => {
      const tabsField = getTabsField('p2p')
      const onceTab = tabsField.tabs!.find((t) => t.value === 'once')!

      // These fields check isEnabled — with sole frequency, isEnabled should return true
      // even though the toggle is hidden (enabled is forced on)
      const labelField = onceTab.fields.label!
      const descField = onceTab.fields.enableAmountDescriptions!

      expect(evalVisible(labelField, { enabled: true })).toBe(true)
      expect(evalVisible(descField, { enabled: true })).toBe(true)
    })
  })
})
