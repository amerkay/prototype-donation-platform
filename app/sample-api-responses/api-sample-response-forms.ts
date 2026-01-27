import type { CampaignForm } from '~/features/campaigns/shared/types'
import type { FullFormConfig } from '~/features/donation-form/shared/stores/formConfig'
import { formConfig as fullFormConfig } from './api-sample-response-form-config'
import { products as fullProducts } from './api-sample-response-products'

/**
 * Sample forms for campaigns
 * Each campaign can have multiple forms with different configurations
 */

// Full-featured form configuration
const fullFeaturedConfig = {
  ...fullFormConfig,
  campaignId: 'adopt-orangutan'
}

// Minimal form configuration (most features disabled)
const minimalFormConfig = {
  version: '1.0',
  campaignId: 'adopt-orangutan',
  form: {
    title: 'Quick Donation',
    subtitle: 'Support orangutan conservation'
  },
  pricing: {
    baseDefaultCurrency: 'GBP',
    frequencies: {
      once: {
        enabled: true,
        label: 'One-time',
        presetAmounts: [10, 25, 50, 100],
        customAmount: { min: 5, max: 1000 }
      },
      monthly: {
        enabled: false,
        label: 'Monthly',
        presetAmounts: [5, 10, 25, 50],
        customAmount: { min: 3, max: 500 }
      },
      yearly: {
        enabled: false,
        label: 'Yearly',
        presetAmounts: [50, 100, 250, 500],
        customAmount: { min: 25, max: 2000 }
      }
    }
  },
  features: {
    impactCart: {
      enabled: false,
      settings: {
        initialDisplay: 3
      }
    },
    productSelector: {
      enabled: false,
      config: {
        icon: '🦧',
        entity: { singular: 'Orangutan', plural: 'Orangutans' },
        action: { verb: 'Adopt', noun: 'adoption' }
      }
    },
    impactJourney: {
      enabled: false,
      messaging: {
        emoji: '❤️',
        onceHeadline: 'Your Support Today',
        monthlyHeadline: "Every Day You're There",
        yearlyHeadline: "Every Day You're There"
      },
      impactPerAmount: {
        items: []
      },
      upsells: {
        upsellOnceToRecurring: false,
        upsellCtaCopy: '',
        upsellIncreaseAmount: false,
        upsellIncreaseCtaCopy: ''
      }
    },
    coverCosts: {
      enabled: false,
      settings: {
        heading: 'Cover processing costs',
        description: 'Help us cover transaction fees',
        defaultPercentage: 0
      }
    },
    giftAid: {
      enabled: true
    },
    tribute: {
      enabled: false,
      icons: {
        gift: '🎁',
        memorial: '🕊️',
        tribute: '💝'
      },
      types: {
        none: { label: 'No, thank you' },
        giftEnabled: false,
        memorialEnabled: false
      },
      relationships: [],
      modal: {
        title: 'Gift or In Memory',
        subtitle: ''
      }
    },
    customFields: {
      customFieldsTabs: {}
    }
  }
}

// Minimal products list (just one product)
const minimalProducts = [
  {
    id: 'orangutan-basic',
    name: 'Support an Orangutan',
    description: 'Your donation helps provide care for rescued orangutans',
    price: 25,
    frequency: 'once' as const,
    image: '🦧',
    thumbnail: '🦧',
    icon: '🦧'
  }
]

/**
 * Forms for "Adopt an Orangutan" campaign
 */
export const adoptOrangutanForms: CampaignForm[] = [
  {
    id: 'form-orangutan-full',
    campaignId: 'adopt-orangutan',
    name: 'Full Experience Form',
    isDefault: true,
    config: fullFeaturedConfig as unknown as FullFormConfig,
    products: fullProducts,
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-12-15T14:30:00Z'
  },
  {
    id: 'form-orangutan-simple',
    campaignId: 'adopt-orangutan',
    name: 'Simple Quick Donation',
    isDefault: false,
    config: minimalFormConfig as unknown as FullFormConfig,
    products: minimalProducts,
    createdAt: '2024-02-01T09:00:00Z',
    updatedAt: '2024-11-20T11:00:00Z'
  }
]

/**
 * Forms for "Ocean Conservation" campaign
 */
export const oceanConservationForms: CampaignForm[] = [
  {
    id: 'form-ocean-default',
    campaignId: 'ocean-conservation',
    name: 'Ocean Conservation Form',
    isDefault: true,
    config: {
      ...minimalFormConfig,
      campaignId: 'ocean-conservation',
      form: {
        title: 'Protect Our Oceans',
        subtitle: 'Help us preserve marine ecosystems'
      }
    } as unknown as FullFormConfig,
    products: [
      {
        id: 'ocean-protection',
        name: 'Ocean Protection',
        description: 'Support marine conservation efforts',
        price: 30,
        frequency: 'once' as const,
        image: '🌊',
        thumbnail: '🌊',
        icon: '🌊'
      }
    ],
    createdAt: '2024-03-10T10:00:00Z',
    updatedAt: '2024-12-01T16:00:00Z'
  }
]

/**
 * Forms for "Emergency Relief" campaign
 */
export const emergencyReliefForms: CampaignForm[] = [
  {
    id: 'form-relief-urgent',
    campaignId: 'emergency-relief',
    name: 'Emergency Relief Form',
    isDefault: true,
    config: {
      ...minimalFormConfig,
      campaignId: 'emergency-relief',
      form: {
        title: 'Emergency Relief',
        subtitle: 'Provide immediate aid to those in need'
      }
    } as unknown as FullFormConfig,
    products: [
      {
        id: 'relief-package',
        name: 'Relief Package',
        description: 'Essential supplies for families in crisis',
        price: 50,
        frequency: 'once' as const,
        image: '📦',
        thumbnail: '📦',
        icon: '📦'
      }
    ],
    createdAt: '2024-06-05T08:00:00Z',
    updatedAt: '2024-12-10T09:30:00Z'
  }
]

/**
 * Get all forms for a specific campaign
 */
export function getFormsByCampaignId(campaignId: string): CampaignForm[] {
  switch (campaignId) {
    case 'adopt-orangutan':
      return adoptOrangutanForms
    case 'ocean-conservation':
      return oceanConservationForms
    case 'emergency-relief':
      return emergencyReliefForms
    default:
      return []
  }
}

/**
 * Get default form for a campaign
 */
export function getDefaultForm(campaignId: string): CampaignForm | undefined {
  const forms = getFormsByCampaignId(campaignId)
  return forms.find((form) => form.isDefault) || forms[0]
}

/**
 * Get specific form by ID
 */
export function getFormById(formId: string): CampaignForm | undefined {
  const allForms = [...adoptOrangutanForms, ...oceanConservationForms, ...emergencyReliefForms]
  return allForms.find((form) => form.id === formId)
}
