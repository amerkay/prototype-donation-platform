import { describe, it, expect, beforeEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useCampaignConfigStore } from '~/features/campaigns/shared/stores/campaignConfig'
import type { FullFormConfig } from '~/features/donation-form/shared/types'
import type { Campaign, CampaignForm } from '~/features/campaigns/shared/types'
import type { Product } from '~/features/donation-form/features/product/shared/types'

// Mock useCampaigns so we can verify updateCampaign is called
const mockUpdateCampaign = vi.fn()
vi.mock('~/features/campaigns/shared/composables/useCampaigns', () => ({
  useCampaigns: () => ({
    updateCampaign: mockUpdateCampaign
  })
}))

/** Minimal form config for testing */
function makeFormConfig(): FullFormConfig {
  return {
    version: '1.0',
    form: { type: 'donation' } as unknown as FullFormConfig['form'],
    donationAmounts: {
      baseDefaultCurrency: 'GBP',
      frequencies: {
        once: { enabled: true, presets: [5, 10, 25, 50] }
      }
    } as unknown as FullFormConfig['donationAmounts'],
    features: {
      impactCart: { enabled: true, settings: {} },
      productSelector: { enabled: false },
      impactBoost: { enabled: false },
      coverCosts: { enabled: false },
      tribute: { enabled: false },
      customFields: { customFieldsTabs: {} },
      entryFields: { enabled: false, mode: 'shared', fields: [] },
      contactConsent: { enabled: true, settings: { label: 'Join', description: 'Desc' } },
      terms: { enabled: true }
    } as unknown as FullFormConfig['features']
  }
}

function makeProduct(id: string, name: string): Product {
  return {
    id,
    name,
    title: name,
    description: `${name} description`,
    price: 10,
    frequency: 'once',
    image: null
  }
}

function makeCampaignForm(products: Product[]): CampaignForm {
  return {
    id: 'form-1',
    campaignId: 'camp-1',
    name: 'Test Form',
    isDefault: true,
    config: makeFormConfig(),
    products,
    createdAt: '2025-01-01T00:00:00Z',
    updatedAt: '2025-01-01T00:00:00Z'
  }
}

function makeCampaign(products: Product[]): Campaign {
  return {
    id: 'camp-1',
    type: 'standard',
    name: 'Test Campaign',
    status: 'active',
    isArchived: false,
    createdAt: '2025-01-01T00:00:00Z',
    updatedAt: '2025-01-01T00:00:00Z',
    stats: {
      totalRaised: 0,
      totalMatched: 0,
      totalDonations: 0,
      totalDonors: 0,
      averageDonation: 0,
      topDonation: 0,
      currency: 'GBP'
    },
    crowdfunding: {
      enabled: true,
      currency: 'GBP',
      title: 'Test',
      shortDescription: 'Test',
      showProgressBar: true,
      showRecentDonations: true,
      defaultDonationsView: 'recent',
      numberOfDonationsToShow: 5,
      enableSocialSharing: true
    },
    peerToPeer: { enabled: false },
    matchedGiving: { periods: [] },
    fundraisers: [],
    recentDonations: [],
    form: makeCampaignForm(products)
  } as Campaign
}

describe('useForm', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    mockUpdateCampaign.mockReset()
  })

  it('syncs product removal to campaigns singleton on save', async () => {
    const { useForm } = await import('~/features/campaigns/shared/composables/useForm')

    const productA = makeProduct('prod-a', 'Standard Stall')
    const productB = makeProduct('prod-b', 'Large Stall')

    // Initialize campaign config store with 2 products
    const configStore = useCampaignConfigStore()
    configStore.initialize(makeCampaign([productA, productB]))

    const { updateForm } = useForm()

    // Simulate removing productB (user clicks X) — mutate formConfig directly
    configStore.formConfig.products = [productA]

    await updateForm()

    // updateCampaign MUST be called with the updated form (only 1 product)
    expect(mockUpdateCampaign).toHaveBeenCalledOnce()
    expect(mockUpdateCampaign).toHaveBeenCalledWith('camp-1', {
      form: expect.objectContaining({
        products: expect.arrayContaining([expect.objectContaining({ id: 'prod-a' })])
      })
    })

    // The saved form should only have 1 product
    const savedForm = mockUpdateCampaign.mock.calls[0]![1].form as CampaignForm
    expect(savedForm.products).toHaveLength(1)
    expect(savedForm.products[0]!.id).toBe('prod-a')
  })

  it('does not call updateCampaign when store has no form', async () => {
    const { useForm } = await import('~/features/campaigns/shared/composables/useForm')

    const configStore = useCampaignConfigStore()
    // Initialize without a form
    const campaign = makeCampaign([])
    campaign.form = null
    configStore.initialize(campaign)

    const { updateForm } = useForm()
    await updateForm()

    expect(mockUpdateCampaign).not.toHaveBeenCalled()
  })
})
