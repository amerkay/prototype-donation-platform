import { describe, it, expect, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useCampaignConfigStore } from '~/features/campaigns/shared/stores/campaignConfig'
import {
  useFormConfigStore,
  type FullFormConfig
} from '~/features/donation-form/shared/stores/formConfig'
import type {
  Campaign,
  CampaignForm,
  CampaignType,
  CampaignStats,
  CrowdfundingSettings,
  PeerToPeerSettings
} from '~/features/campaigns/shared/types'

/** Minimal campaign factory */
function makeCampaign(overrides: Partial<Campaign> = {}): Campaign {
  const defaultStats: CampaignStats = {
    totalRaised: 0,
    totalMatched: 0,
    totalDonations: 0,
    totalDonors: 0,
    averageDonation: 0,
    topDonation: 0,
    currency: 'GBP'
  }
  const defaultCrowdfunding: CrowdfundingSettings = {
    enabled: true,
    currency: 'GBP',
    title: 'Test Campaign',
    shortDescription: 'Test description',
    showProgressBar: true,
    showRecentDonations: true,
    defaultDonationsView: 'recent',
    numberOfDonationsToShow: 5,
    enableSocialSharing: true
  }
  const defaultP2P: PeerToPeerSettings = { enabled: false }

  return {
    id: 'camp-1',
    type: 'standard',
    name: 'Test Campaign',
    status: 'draft',
    isArchived: false,
    createdAt: '2025-01-01T00:00:00Z',
    updatedAt: '2025-01-01T00:00:00Z',
    stats: defaultStats,
    crowdfunding: defaultCrowdfunding,
    peerToPeer: defaultP2P,
    matchedGiving: { periods: [] },
    fundraisers: [],
    recentDonations: [],
    form: null,
    ...overrides
  } as Campaign
}

describe('Campaign Config Store', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  describe('currency getter/setter', () => {
    it('returns crowdfunding.currency when set', () => {
      const store = useCampaignConfigStore()
      store.crowdfunding = { currency: 'EUR' } as CrowdfundingSettings
      expect(store.currency).toBe('EUR')
    })

    it('returns empty string when crowdfunding is null', () => {
      const store = useCampaignConfigStore()
      expect(store.crowdfunding).toBeNull()
      expect(store.currency).toBe('')
    })

    it('allows setting currency when id is null (new campaign)', () => {
      const store = useCampaignConfigStore()
      store.crowdfunding = { currency: '' } as CrowdfundingSettings
      expect(store.id).toBeNull()

      store.currency = 'USD'
      expect(store.currency).toBe('USD')
    })

    it('allows setting currency when crowdfunding.currency is empty string', () => {
      const store = useCampaignConfigStore()
      store.id = 'camp-1'
      store.crowdfunding = { currency: '' } as CrowdfundingSettings

      store.currency = 'EUR'
      expect(store.currency).toBe('EUR')
    })

    it('silently ignores currency set when id exists AND currency is already set', () => {
      const store = useCampaignConfigStore()
      store.id = 'camp-1'
      store.crowdfunding = { currency: 'GBP' } as CrowdfundingSettings

      store.currency = 'USD'
      expect(store.currency).toBe('GBP')
    })

    it.each<CampaignType>(['standard', 'p2p', 'p2p-fundraiser'])(
      'immutability applies to %s campaigns',
      (campaignType: CampaignType) => {
        const store = useCampaignConfigStore()
        store.initialize(makeCampaign({ type: campaignType, id: 'camp-1' }))

        store.currency = 'USD'
        expect(store.currency).toBe('GBP') // original value preserved
      }
    )
  })

  describe('initialize and reset', () => {
    it('initialize populates currency from campaign crowdfunding data', () => {
      const store = useCampaignConfigStore()
      store.initialize(
        makeCampaign({
          crowdfunding: {
            currency: 'EUR'
          } as CrowdfundingSettings
        })
      )
      expect(store.currency).toBe('EUR')
      expect(store.id).toBe('camp-1')
    })

    it('reset clears currency (crowdfunding becomes null)', () => {
      const store = useCampaignConfigStore()
      store.initialize(makeCampaign())
      expect(store.currency).toBe('GBP')

      store.reset()
      expect(store.crowdfunding).toBeNull()
      expect(store.currency).toBe('')
    })
  })

  describe('hasMatchedGiving', () => {
    it('returns false when no match periods exist', () => {
      const store = useCampaignConfigStore()
      store.initialize(makeCampaign())
      expect(store.hasMatchedGiving).toBe(false)
    })

    it('returns true when match periods exist (regardless of campaign type)', () => {
      const store = useCampaignConfigStore()
      store.initialize(
        makeCampaign({
          type: 'standard',
          matchedGiving: {
            periods: [
              {
                id: 'mp-1',
                name: 'Test Match',
                matchMultiplier: 2,
                poolAmount: 10000,
                poolDrawn: 0,
                startDate: '2026-01-01T00:00:00Z',
                endDate: '2026-12-31T00:00:00Z'
              }
            ]
          }
        })
      )
      expect(store.hasMatchedGiving).toBe(true)
    })

    it('matchedTotal includes pool drawn when matching is active', () => {
      const store = useCampaignConfigStore()
      store.initialize(
        makeCampaign({
          type: 'standard',
          stats: {
            totalRaised: 5000,
            totalMatched: 3000,
            totalDonations: 50,
            totalDonors: 40,
            averageDonation: 100,
            topDonation: 500,
            currency: 'GBP'
          },
          matchedGiving: {
            periods: [
              {
                id: 'mp-1',
                name: 'Test Match',
                matchMultiplier: 2,
                poolAmount: 10000,
                poolDrawn: 3000,
                startDate: '2026-01-01T00:00:00Z',
                endDate: '2026-12-31T00:00:00Z'
              }
            ]
          }
        })
      )
      expect(store.matchedTotal).toBe(8000) // 5000 raised + 3000 matched (from stats.totalMatched)
    })
  })

  describe('fullCampaign includes form', () => {
    it('fullCampaign snapshot includes the current form value', () => {
      const store = useCampaignConfigStore()
      const testForm = {
        id: 'form-1',
        campaignId: 'camp-1',
        name: 'Test Form',
        isDefault: true,
        config: { features: {} },
        products: [],
        createdAt: '2025-01-01T00:00:00Z',
        updatedAt: '2025-01-01T00:00:00Z'
      }
      store.initialize(makeCampaign({ form: testForm as unknown as CampaignForm }))

      expect(store.fullCampaign?.form).toEqual(testForm)
    })

    it('fullCampaign reflects form changes after initializeFormConfig', () => {
      const store = useCampaignConfigStore()
      store.initialize(
        makeCampaign({
          form: {
            id: 'old-form',
            campaignId: 'camp-1',
            name: 'Old Form',
            isDefault: true,
            config: { features: {} },
            products: [],
            createdAt: '2025-01-01T00:00:00Z',
            updatedAt: '2025-01-01T00:00:00Z'
          } as unknown as CampaignForm
        })
      )

      // Simulate setForm (Replace with template / Copy from) via initializeFormConfig
      const newForm = {
        id: 'new-form',
        campaignId: 'camp-1',
        name: 'New Template Form',
        isDefault: true,
        config: {
          version: '1.0',
          form: { title: 'Test', subtitle: '' },
          donationAmounts: {
            baseDefaultCurrency: 'GBP',
            frequencies: {
              once: { enabled: true, presetAmounts: [], customAmount: { min: 1, max: 1000 } },
              monthly: { enabled: false, presetAmounts: [], customAmount: { min: 1, max: 1000 } },
              yearly: { enabled: false, presetAmounts: [], customAmount: { min: 1, max: 1000 } }
            }
          },
          features: {
            impactCart: { enabled: false, settings: {} },
            productSelector: { enabled: false },
            impactBoost: { enabled: false },
            coverCosts: { enabled: false },
            tribute: { enabled: false },
            customFields: { customFieldsTabs: {} },
            entryFields: { enabled: false, mode: 'shared', fields: [] },
            contactConsent: { enabled: true, settings: { label: 'Join', description: 'Desc' } },
            terms: { enabled: true }
          }
        },
        products: [{ id: 'p1', title: 'Product 1' }],
        createdAt: '2025-02-01T00:00:00Z',
        updatedAt: '2025-02-01T00:00:00Z'
      }
      store.initializeFormConfig(newForm as unknown as CampaignForm)
      store.form = newForm as unknown as CampaignForm
      store.markDirty()

      // fullCampaign (used by onSave) MUST reflect the new form via assembledForm
      expect(store.fullCampaign?.form?.id).toBe('new-form')
      expect(store.fullCampaign?.form?.name).toBe('New Template Form')
    })
  })

  describe('progressPercentage', () => {
    it('computes correctly (totalRaised / goalAmount × 100, capped at 100)', () => {
      const store = useCampaignConfigStore()
      store.initialize(
        makeCampaign({
          crowdfunding: {
            enabled: true,
            currency: 'GBP',
            goalAmount: 1000,
            title: 'T',
            shortDescription: 'D',
            showProgressBar: true,
            showRecentDonations: true,
            defaultDonationsView: 'recent',
            numberOfDonationsToShow: 5,
            enableSocialSharing: true
          },
          stats: {
            totalRaised: 750,
            totalMatched: 0,
            totalDonations: 10,
            totalDonors: 8,
            averageDonation: 75,
            topDonation: 200,
            currency: 'GBP'
          }
        })
      )

      expect(store.progressPercentage).toBe(75)
    })

    it('caps at 100 when totalRaised exceeds goalAmount', () => {
      const store = useCampaignConfigStore()
      store.initialize(
        makeCampaign({
          crowdfunding: {
            enabled: true,
            currency: 'GBP',
            goalAmount: 100,
            title: 'T',
            shortDescription: 'D',
            showProgressBar: true,
            showRecentDonations: true,
            defaultDonationsView: 'recent',
            numberOfDonationsToShow: 5,
            enableSocialSharing: true
          },
          stats: {
            totalRaised: 200,
            totalMatched: 0,
            totalDonations: 2,
            totalDonors: 2,
            averageDonation: 100,
            topDonation: 100,
            currency: 'GBP'
          }
        })
      )

      expect(store.progressPercentage).toBe(100)
    })
  })

  describe('initialize: reference isolation', () => {
    it('mutating nested store data must NOT mutate the original campaign object', () => {
      // If initialize only does shallow spread, nested objects like
      // matchedGiving.periods share references with the source.
      // Pushing to the store array then corrupts the source, breaking discard.
      const campaign = makeCampaign({
        type: 'p2p-fundraiser',
        matchedGiving: {
          periods: [
            { id: 'p1', multiplier: 2, startDate: '2025-01-01', poolAmount: 1000, poolDrawn: 0 }
          ]
        } as unknown as Campaign['matchedGiving']
      })

      const store = useCampaignConfigStore()
      store.initialize(campaign)

      // Mutate a nested property on the store
      store.matchedGiving!.periods.push({
        id: 'p2',
        multiplier: 3,
        startDate: '2025-06-01',
        poolAmount: 500,
        poolDrawn: 0
      } as unknown as Campaign['matchedGiving']['periods'][number])

      // Source campaign MUST still have only 1 period
      expect(campaign.matchedGiving.periods).toHaveLength(1)
    })

    it('markDirty stays false when Object.assign writes identical crowdfunding data', () => {
      const store = useCampaignConfigStore()
      store.initialize(makeCampaign({ type: 'p2p-fundraiser' }))
      store.markClean()

      // Simulate CampaignMasterConfigPanel setData with identical values
      const currentCrowdfunding = JSON.parse(JSON.stringify(store.crowdfunding))
      const changed = JSON.stringify(store.crowdfunding) !== JSON.stringify(currentCrowdfunding)
      Object.assign(store.crowdfunding!, currentCrowdfunding)
      if (changed) store.markDirty()

      // Without compare-before-write, markDirty would unconditionally set isDirty=true
      // With it, identical data should NOT trigger dirty
      expect(store.isDirty).toBe(false)
    })
  })

  describe('remainingAmount', () => {
    it('equals goalAmount - totalRaised, floored at 0', () => {
      const store = useCampaignConfigStore()
      store.initialize(
        makeCampaign({
          crowdfunding: {
            enabled: true,
            currency: 'GBP',
            goalAmount: 1000,
            title: 'T',
            shortDescription: 'D',
            showProgressBar: true,
            showRecentDonations: true,
            defaultDonationsView: 'recent',
            numberOfDonationsToShow: 5,
            enableSocialSharing: true
          },
          stats: {
            totalRaised: 300,
            totalMatched: 0,
            totalDonations: 3,
            totalDonors: 3,
            averageDonation: 100,
            topDonation: 100,
            currency: 'GBP'
          }
        })
      )

      expect(store.remainingAmount).toBe(700)
    })

    it('floors at 0 when totalRaised exceeds goalAmount', () => {
      const store = useCampaignConfigStore()
      store.initialize(
        makeCampaign({
          crowdfunding: {
            enabled: true,
            currency: 'GBP',
            goalAmount: 100,
            title: 'T',
            shortDescription: 'D',
            showProgressBar: true,
            showRecentDonations: true,
            defaultDonationsView: 'recent',
            numberOfDonationsToShow: 5,
            enableSocialSharing: true
          },
          stats: {
            totalRaised: 500,
            totalMatched: 0,
            totalDonations: 5,
            totalDonors: 5,
            averageDonation: 100,
            topDonation: 100,
            currency: 'GBP'
          }
        })
      )

      expect(store.remainingAmount).toBe(0)
    })
  })
})

describe('FormConfig Store', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  /** Minimal form config for testing */
  function makeFormConfig(overrides: Partial<FullFormConfig> = {}): FullFormConfig {
    return {
      version: '1.0',
      form: { type: 'donation' } as unknown as FullFormConfig['form'],
      donationAmounts: {
        baseDefaultCurrency: 'GBP',
        frequencies: {
          once: { enabled: true, presets: [5, 10, 25, 50] },
          monthly: { enabled: true, presets: [5, 10, 25] },
          yearly: { enabled: true, presets: [10, 25, 50] }
        }
      } as unknown as FullFormConfig['donationAmounts'],
      features: {
        impactCart: { enabled: false, settings: {} },
        productSelector: { enabled: false },
        impactBoost: { enabled: false },
        coverCosts: { enabled: false },
        tribute: { enabled: false },
        customFields: { customFieldsTabs: {} },
        entryFields: { enabled: false, mode: 'shared', fields: [] },
        contactConsent: { enabled: true, settings: { label: 'Join', description: 'Desc' } },
        terms: { enabled: true }
      } as unknown as FullFormConfig['features'],
      ...overrides
    }
  }

  describe('initializeFormConfig: template and copy scenarios', () => {
    /** Full-experience form config with all features enabled */
    function makeFullExperienceConfig(): FullFormConfig {
      return {
        version: '1.0',
        form: { type: 'donation' } as unknown as FullFormConfig['form'],
        donationAmounts: {
          baseDefaultCurrency: 'GBP',
          frequencies: {
            once: { enabled: true, presets: [10, 25, 50, 100] },
            monthly: { enabled: true, presets: [5, 10, 25] },
            yearly: { enabled: true, presets: [25, 50, 100] }
          }
        } as unknown as FullFormConfig['donationAmounts'],
        features: {
          impactCart: { enabled: true, settings: { initialDisplay: 3 } },
          productSelector: {
            enabled: true,
            config: {
              icon: '🎯',
              entity: { singular: 'p', plural: 'ps' },
              action: { verb: 'support', noun: 'p' }
            }
          },
          impactBoost: {
            enabled: true,
            messages: { recurringBoostMessage: 'Go monthly', increaseBoostMessage: 'Give more' },
            upsells: { enableRecurringBoost: true, enableIncreaseBoost: true }
          },
          coverCosts: { enabled: true, percentage: 5 },
          tribute: { enabled: true, settings: { allowDedicationType: true } },
          customFields: { customFieldsTabs: {} },
          entryFields: { enabled: true, mode: 'shared', fields: [] },
          contactConsent: { enabled: true, settings: { label: 'Join', description: 'Desc' } },
          terms: { enabled: true }
        } as unknown as FullFormConfig['features']
      }
    }

    it('full template replaces existing form — all feature properties preserved', () => {
      const store = useFormConfigStore()
      // Start with basic config (features disabled)
      store.initialize(makeFormConfig(), [], 'form-1')
      expect(store.impactBoost?.enabled).toBe(false)

      // Apply full-experience template
      const fullConfig = makeFullExperienceConfig()
      const campaignForm: CampaignForm = {
        id: 'form-2',
        campaignId: 'camp-1',
        name: 'Full Template',
        isDefault: true,
        config: fullConfig,
        products: [{ id: 'p1', title: 'Product 1' }],
        createdAt: '2025-01-01T00:00:00Z',
        updatedAt: '2025-01-01T00:00:00Z'
      } as unknown as CampaignForm

      store.initializeFormConfig(campaignForm)

      // ALL feature properties must be present
      expect(store.impactBoost?.enabled).toBe(true)
      expect(store.impactBoost?.upsells?.enableRecurringBoost).toBe(true)
      expect(store.impactBoost?.upsells?.enableIncreaseBoost).toBe(true)
      expect(store.impactCart?.enabled).toBe(true)
      expect(store.productSelector?.enabled).toBe(true)
      expect(store.coverCosts?.enabled).toBe(true)
      expect(store.tribute?.enabled).toBe(true)
    })

    it('basic template disables features', () => {
      const store = useFormConfigStore()
      // Start with full config
      store.initialize(makeFullExperienceConfig(), [], 'form-1')
      expect(store.impactBoost?.enabled).toBe(true)

      // Apply basic template (features disabled)
      const basicForm: CampaignForm = {
        id: 'form-3',
        campaignId: 'camp-1',
        name: 'Basic Template',
        isDefault: true,
        config: makeFormConfig(), // basic config
        products: [],
        createdAt: '2025-01-01T00:00:00Z',
        updatedAt: '2025-01-01T00:00:00Z'
      } as unknown as CampaignForm

      store.initializeFormConfig(basicForm)

      expect(store.impactBoost?.enabled).toBe(false)
      expect(store.impactCart?.enabled).toBe(false)
      expect(store.coverCosts?.enabled).toBe(false)
      expect(store.tribute?.enabled).toBe(false)
    })

    it('campaign store forwards formConfigStore correctly', () => {
      const formStore = useFormConfigStore()
      const campaignStore = useCampaignConfigStore()

      const fullConfig = makeFullExperienceConfig()
      formStore.initialize(fullConfig, [], 'form-1')

      // campaignStore.formConfig is the formConfigStore instance
      expect(campaignStore.formConfig.impactBoost?.enabled).toBe(true)
      expect(campaignStore.formConfig.impactBoost?.upsells?.enableRecurringBoost).toBe(true)
      expect(campaignStore.formConfig.donationAmounts).toBe(formStore.donationAmounts)
    })

    it('re-initialization fully replaces old values (no bleeding)', () => {
      const store = useFormConfigStore()

      // Init form A with features enabled
      store.initialize(makeFullExperienceConfig(), [], 'form-A')
      expect(store.impactBoost?.enabled).toBe(true)
      expect(store.formId).toBe('form-A')

      // Init form B with features disabled
      store.initialize(makeFormConfig(), [], 'form-B')
      expect(store.impactBoost?.enabled).toBe(false)
      expect(store.formId).toBe('form-B')

      // No bleeding from form A
      expect(store.impactCart?.enabled).toBe(false)
      expect(store.coverCosts?.enabled).toBe(false)
    })

    it('allProducts and fullFormConfig forwarding reflects formConfigStore data', () => {
      const formStore = useFormConfigStore()
      const campaignStore = useCampaignConfigStore()

      const products = [
        {
          id: 'p1',
          name: 'P1',
          title: 'Product 1',
          description: '',
          frequency: 'once' as const,
          image: null
        }
      ]
      formStore.initialize(makeFullExperienceConfig(), products, 'form-1')

      expect(campaignStore.allProducts).toHaveLength(1)
      expect(campaignStore.allProducts[0]!.id).toBe('p1')
      expect(campaignStore.fullFormConfig?.features.impactBoost.enabled).toBe(true)
    })
  })

  describe('reference isolation', () => {
    it('Object.assign on store.donationAmounts must NOT mutate the original config', () => {
      const sourceConfig = makeFormConfig()
      const originalFrequencies = JSON.parse(JSON.stringify(sourceConfig.donationAmounts))

      const store = useFormConfigStore()
      store.initialize(sourceConfig, [], 'form-1')

      // Simulate CampaignMasterConfigPanel setData mutating store in-place
      Object.assign(store.donationAmounts!, {
        frequencies: {
          once: { enabled: true, presets: [51, 10, 25, 50] },
          monthly: { enabled: true, presets: [5, 10, 25] },
          yearly: { enabled: true, presets: [10, 25, 50] }
        }
      })

      // Source config MUST be unchanged — if this fails, discard can't restore
      expect(sourceConfig.donationAmounts).toEqual(originalFrequencies)
    })
  })

  describe('per-feature product isolation', () => {
    it('removing a product from impactCart does NOT affect productSelector products', () => {
      const store = useFormConfigStore()
      const products = [
        {
          id: 'p1',
          name: 'P1',
          title: 'Product 1',
          description: '',
          frequency: 'once' as const,
          image: null
        },
        {
          id: 'p2',
          name: 'P2',
          title: 'Product 2',
          description: '',
          frequency: 'once' as const,
          image: null
        },
        {
          id: 'p3',
          name: 'P3',
          title: 'Product 3',
          description: '',
          frequency: 'once' as const,
          image: null
        }
      ]
      const config = makeFormConfig({
        features: {
          impactCart: { enabled: true, settings: { initialDisplay: 3 } },
          productSelector: {
            enabled: true,
            config: {
              icon: '🎯',
              entity: { singular: 'p', plural: 'ps' },
              action: { verb: 'support', noun: 'p' }
            }
          },
          impactBoost: { enabled: false },
          coverCosts: { enabled: false },
          tribute: { enabled: false },
          customFields: { customFieldsTabs: {} },
          entryFields: { enabled: false, mode: 'shared', fields: [] },
          contactConsent: { enabled: true, settings: { label: 'Join', description: 'Desc' } },
          terms: { enabled: true }
        } as unknown as FullFormConfig['features']
      })

      store.initialize(config, products, 'form-1')

      const campaignStore = useCampaignConfigStore()
      // Both features should have received the shared products
      expect(campaignStore.formConfig.impactCart?.products).toHaveLength(3)
      expect(campaignStore.formConfig.productSelector?.products).toHaveLength(3)

      // Remove p2 from impactCart only
      campaignStore.formConfig.impactCart = {
        ...campaignStore.formConfig.impactCart!,
        products: campaignStore.formConfig.impactCart!.products.filter((p) => p.id !== 'p2')
      }

      // impactCart lost p2, productSelector must still have all 3
      expect(campaignStore.formConfig.impactCart?.products).toHaveLength(2)
      expect(campaignStore.formConfig.productSelector?.products).toHaveLength(3)

      // allProducts (union) should have all 3 (p2 still in productSelector)
      expect(campaignStore.allProducts).toHaveLength(3)
    })

    it('each feature gets independent copies (no shared references)', () => {
      const store = useFormConfigStore()
      const products = [
        {
          id: 'p1',
          name: 'P1',
          title: 'Product 1',
          description: '',
          frequency: 'once' as const,
          image: null
        }
      ]
      store.initialize(makeFormConfig(), products, 'form-1')

      const campaignStore = useCampaignConfigStore()
      const icProducts = campaignStore.formConfig.impactCart?.products
      const psProducts = campaignStore.formConfig.productSelector?.products

      // Must be separate arrays, not the same reference
      expect(icProducts).not.toBe(psProducts)
    })
  })

  describe('frequency enforcement by campaign type', () => {
    it('disables monthly and yearly for p2p-fundraiser campaigns', () => {
      const config = makeFormConfig()
      const store = useFormConfigStore()

      store.initialize(config, [], 'form-1', 'p2p-fundraiser')

      const amounts = store.donationAmounts as unknown as {
        frequencies: {
          once: { enabled: boolean }
          monthly: { enabled: boolean }
          yearly: { enabled: boolean }
        }
      }
      expect(amounts.frequencies.once.enabled).toBe(true)
      expect(amounts.frequencies.monthly.enabled).toBe(false)
      expect(amounts.frequencies.yearly.enabled).toBe(false)
    })

    it('disables monthly and yearly for p2p campaigns', () => {
      const config = makeFormConfig()
      const store = useFormConfigStore()

      store.initialize(config, [], 'form-1', 'p2p')

      const amounts = store.donationAmounts as unknown as {
        frequencies: { monthly: { enabled: boolean }; yearly: { enabled: boolean } }
      }
      expect(amounts.frequencies.monthly.enabled).toBe(false)
      expect(amounts.frequencies.yearly.enabled).toBe(false)
    })

    it('preserves monthly and yearly for standard campaigns', () => {
      const config = makeFormConfig()
      const store = useFormConfigStore()

      store.initialize(config, [], 'form-1', 'standard')

      const amounts = store.donationAmounts as unknown as {
        frequencies: { monthly: { enabled: boolean }; yearly: { enabled: boolean } }
      }
      expect(amounts.frequencies.monthly.enabled).toBe(true)
      expect(amounts.frequencies.yearly.enabled).toBe(true)
    })

    it('preserves all frequencies when no campaignType is provided', () => {
      const config = makeFormConfig()
      const store = useFormConfigStore()

      store.initialize(config, [], 'form-1')

      const amounts = store.donationAmounts as unknown as {
        frequencies: { monthly: { enabled: boolean }; yearly: { enabled: boolean } }
      }
      expect(amounts.frequencies.monthly.enabled).toBe(true)
      expect(amounts.frequencies.yearly.enabled).toBe(true)
    })
  })
})
