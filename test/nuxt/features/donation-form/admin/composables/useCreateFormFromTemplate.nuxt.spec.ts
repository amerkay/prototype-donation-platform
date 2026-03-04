import { describe, it, expect, beforeEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useCreateFormFromTemplate } from '~/features/donation-form/admin/composables/useCreateFormFromTemplate'
import { useCurrencySettingsStore } from '~/features/settings/admin/stores/currencySettings'
import { TEMPLATE_REGISTRY } from '~/features/donation-form/admin/templates'

// Mock useProducts — seedProducts just passes through for testing
vi.mock('~/features/products/admin/composables/useProducts', () => ({
  useProducts: () => ({
    seedProducts: (products: unknown[]) => products
  })
}))

describe('useCreateFormFromTemplate', () => {
  beforeEach(() => {
    setActivePinia(createPinia())

    const currencyStore = useCurrencySettingsStore()
    currencyStore.initialize({
      supportedCurrencies: ['GBP', 'USD'],
      defaultCurrency: 'GBP',
      currencyMultipliers: {}
    })
  })

  const basicTemplate = TEMPLATE_REGISTRY.find((t) => t.metadata.id === 'basic')!

  it('creates a form with the expected id and name', () => {
    const { createFormFromTemplate } = useCreateFormFromTemplate()
    const result = createFormFromTemplate('camp-1', basicTemplate, [])

    expect(result.formId).toContain('camp-1')
    expect(result.formId).toContain('basic')
    expect(result.formName).toBe('Basic')
  })

  it('deduplicates form name when name already exists', () => {
    const { createFormFromTemplate } = useCreateFormFromTemplate()
    const result = createFormFromTemplate('camp-1', basicTemplate, ['Basic'])

    expect(result.formName).toBe('Basic 1')
  })

  it('uses override currency instead of org default', () => {
    const { createFormFromTemplate } = useCreateFormFromTemplate()
    const result = createFormFromTemplate('camp-1', basicTemplate, [], 'USD')

    expect(result.config.donationAmounts.baseDefaultCurrency).toBe('USD')
  })

  it('populates enabledCurrencies from org settings', () => {
    const { createFormFromTemplate } = useCreateFormFromTemplate()
    const result = createFormFromTemplate('camp-1', basicTemplate, [])

    expect(result.config.donationAmounts.enabledCurrencies).toEqual(['GBP', 'USD'])
  })

  describe('recurring enforcement by campaign type', () => {
    it('without campaignType, monthly stays enabled (from template default)', () => {
      const { createFormFromTemplate } = useCreateFormFromTemplate()
      const result = createFormFromTemplate('camp-1', basicTemplate, [])

      expect(result.config.donationAmounts.frequencies.monthly.enabled).toBe(true)
    })

    it('standard campaign keeps monthly and yearly enabled', () => {
      const { createFormFromTemplate } = useCreateFormFromTemplate()
      const result = createFormFromTemplate('camp-1', basicTemplate, [], undefined, 'standard')

      expect(result.config.donationAmounts.frequencies.monthly.enabled).toBe(true)
      // yearly is disabled in basic template by default, not because of campaignType
    })

    it('P2P campaign disables monthly frequency', () => {
      const { createFormFromTemplate } = useCreateFormFromTemplate()
      const result = createFormFromTemplate('camp-1', basicTemplate, [], undefined, 'p2p')

      expect(result.config.donationAmounts.frequencies.monthly.enabled).toBe(false)
    })

    it('P2P campaign disables yearly frequency', () => {
      const { createFormFromTemplate } = useCreateFormFromTemplate()
      const result = createFormFromTemplate('camp-1', basicTemplate, [], undefined, 'p2p')

      expect(result.config.donationAmounts.frequencies.yearly.enabled).toBe(false)
    })

    it('event campaign disables monthly and yearly frequencies', () => {
      const { createFormFromTemplate } = useCreateFormFromTemplate()
      const result = createFormFromTemplate('camp-1', basicTemplate, [], undefined, 'event')

      expect(result.config.donationAmounts.frequencies.monthly.enabled).toBe(false)
      expect(result.config.donationAmounts.frequencies.yearly.enabled).toBe(false)
    })

    it('P2P campaign keeps one-time frequency enabled', () => {
      const { createFormFromTemplate } = useCreateFormFromTemplate()
      const result = createFormFromTemplate('camp-1', basicTemplate, [], undefined, 'p2p')

      expect(result.config.donationAmounts.frequencies.once.enabled).toBe(true)
    })

    it('P2P-fundraiser campaign disables recurring frequencies', () => {
      const { createFormFromTemplate } = useCreateFormFromTemplate()
      const result = createFormFromTemplate(
        'camp-1',
        basicTemplate,
        [],
        undefined,
        'p2p-fundraiser'
      )

      expect(result.config.donationAmounts.frequencies.monthly.enabled).toBe(false)
      expect(result.config.donationAmounts.frequencies.yearly.enabled).toBe(false)
    })
  })
})
