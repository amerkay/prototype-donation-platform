import { describe, it, expect, beforeEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useFormsStore } from '~/features/campaigns/shared/stores/forms'
import type { FullFormConfig } from '~/features/donation-form/shared/stores/formConfig'
import type { Product } from '~/features/donation-form/features/product/shared/types'

describe('useFormsStore', () => {
  beforeEach(() => {
    // Create fresh pinia instance for each test
    setActivePinia(createPinia())
  })

  it('initializes forms from sample data', () => {
    const store = useFormsStore()
    const forms = store.getForms('adopt-orangutan')

    expect(forms.length).toBeGreaterThan(0)
    expect(forms[0]).toHaveProperty('id')
    expect(forms[0]).toHaveProperty('name')
    expect(forms[0]).toHaveProperty('isDefault')
  })

  it('sets form as default and clears previous default', () => {
    const store = useFormsStore()
    const campaignId = 'adopt-orangutan'

    // Ensure at least 2 forms exist
    const forms = store.getForms(campaignId)
    if (forms.length < 2) {
      store.addForm(campaignId, 'form-test-second', 'Second Test Form', {} as FullFormConfig, [])
    }
    expect(forms.length).toBeGreaterThanOrEqual(2)

    const firstFormId = forms[0]!.id
    const secondFormId = forms[1]!.id

    // Initially first form should be default
    expect(forms[0]!.isDefault).toBe(true)
    expect(forms[1]!.isDefault).toBe(false)

    // Set second form as default
    store.setDefaultForm(campaignId, secondFormId)

    // Verify second form is now default and first is not
    expect(forms[0]!.isDefault).toBe(false)
    expect(forms[1]!.isDefault).toBe(true)

    // Set first form back as default
    store.setDefaultForm(campaignId, firstFormId)

    // Verify first form is default again
    expect(forms[0]!.isDefault).toBe(true)
    expect(forms[1]!.isDefault).toBe(false)
  })

  it('handles non-existent form ID gracefully', () => {
    const store = useFormsStore()
    const campaignId = 'adopt-orangutan'

    const forms = store.getForms(campaignId)

    // Try to set non-existent form as default
    store.setDefaultForm(campaignId, 'non-existent-id')

    // Original default should be cleared but no new default set
    const hasDefault = forms.some((f) => f.isDefault)
    expect(hasDefault).toBe(false)
  })

  it('maintains separate state for different campaigns', () => {
    const store = useFormsStore()

    const orangutanForms = store.getForms('adopt-orangutan')
    const otherForms = store.getForms('other-campaign')

    // They should be independent arrays
    expect(orangutanForms).not.toBe(otherForms)
  })

  it('returns same reference for subsequent calls to same campaign', () => {
    const store = useFormsStore()

    const forms1 = store.getForms('adopt-orangutan')
    const forms2 = store.getForms('adopt-orangutan')

    // Should return same reference (reactive state)
    expect(forms1).toBe(forms2)
  })

  describe('updateFormConfig', () => {
    it('updates form config', () => {
      const store = useFormsStore()
      const campaignId = 'adopt-orangutan'
      const forms = store.getForms(campaignId)
      const formId = forms[0]!.id

      const newConfig = { ...forms[0]!.config, testFlag: true } as FullFormConfig
      store.updateFormConfig(campaignId, formId, newConfig)

      expect(forms[0]!.config).toStrictEqual(newConfig)
    })

    it('sets updatedAt timestamp', () => {
      vi.useFakeTimers()
      const store = useFormsStore()
      const campaignId = 'adopt-orangutan'
      const forms = store.getForms(campaignId)
      const formId = forms[0]!.id
      const before = forms[0]!.updatedAt

      // Advance time to ensure timestamp changes
      vi.advanceTimersByTime(1)
      store.updateFormConfig(campaignId, formId, forms[0]!.config)

      expect(forms[0]!.updatedAt).not.toBe(before)
      // Should be a valid ISO string
      expect(new Date(forms[0]!.updatedAt).getTime()).toBeGreaterThan(0)

      vi.useRealTimers()
    })

    it('updates products when provided', () => {
      const store = useFormsStore()
      const campaignId = 'adopt-orangutan'
      const forms = store.getForms(campaignId)
      const formId = forms[0]!.id
      const newProducts = [{ id: 'p1', name: 'Test' }] as Product[]

      store.updateFormConfig(campaignId, formId, forms[0]!.config, newProducts)

      expect(forms[0]!.products).toStrictEqual(newProducts)
    })

    it('logs error for non-existent form', () => {
      const store = useFormsStore()
      const spy = vi.spyOn(console, 'error').mockImplementation(() => {})

      store.updateFormConfig('adopt-orangutan', 'nonexistent', {} as FullFormConfig)

      expect(spy).toHaveBeenCalledWith('Form nonexistent not found')
      spy.mockRestore()
    })
  })
})
