import { describe, it, expect, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { computed } from 'vue'
import { useCrowdfundingSettingsForm } from '~/features/campaigns/features/crowdfunding/admin/forms/crowdfunding-settings-form'
import { useCampaignConfigStore } from '~/features/campaigns/shared/stores/campaignConfig'
import { useCurrencySettingsStore } from '~/features/settings/admin/stores/currencySettings'
import type { FieldDef, FieldContext } from '~/features/_library/form-builder/types'

describe('Crowdfunding Settings Form — Currency Visibility', () => {
  beforeEach(() => {
    setActivePinia(createPinia())

    const currencyStore = useCurrencySettingsStore()
    currencyStore.initialize({
      supportedCurrencies: ['GBP', 'USD', 'EUR'],
      defaultCurrency: 'GBP',
      currencyMultipliers: {}
    })
  })

  /** Get the resolved field definitions by calling the form's setup function */
  function getFields() {
    const ctx = {
      values: computed(() => ({ enabled: true })),
      form: computed(() => ({}))
    }
    return useCrowdfundingSettingsForm.setup(ctx) as Record<string, FieldDef>
  }

  function evalVisible(field: FieldDef, values: Record<string, unknown>): boolean {
    if (!field.visibleWhen) return true
    if (typeof field.visibleWhen === 'function') {
      const ctx: FieldContext = { values, root: values }
      return field.visibleWhen(ctx)
    }
    return true
  }

  it('currency combobox is visible when store.id is falsy (new campaign)', () => {
    const store = useCampaignConfigStore()
    store.id = null

    const fields = getFields()
    expect(evalVisible(fields.currency!, { enabled: true })).toBe(true)
  })

  it('currency combobox is hidden when store.id exists (existing campaign)', () => {
    const store = useCampaignConfigStore()
    store.id = 'camp-1'

    const fields = getFields()
    expect(evalVisible(fields.currency!, { enabled: true })).toBe(false)
  })

  it('currencyNotice alert is hidden when store.id is falsy', () => {
    const store = useCampaignConfigStore()
    store.id = null

    const fields = getFields()
    expect(evalVisible(fields.currencyNotice!, { enabled: true })).toBe(false)
  })

  it('currencyNotice alert is visible when store.id exists', () => {
    const store = useCampaignConfigStore()
    store.id = 'camp-1'

    const fields = getFields()
    expect(evalVisible(fields.currencyNotice!, { enabled: true })).toBe(true)
  })

  it('both fields hidden when crowdfunding is disabled (enabled = false)', () => {
    const store = useCampaignConfigStore()
    store.id = null

    const fields = getFields()
    // When enabled is false, isEnabled returns false, so both should be hidden
    expect(evalVisible(fields.currency!, { enabled: false })).toBe(false)
    expect(evalVisible(fields.currencyNotice!, { enabled: false })).toBe(false)
  })
})
