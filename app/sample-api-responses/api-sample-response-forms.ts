import type { CampaignForm } from '~/features/campaigns/shared/types'
import type { FullFormConfig } from '~/features/donation-form/shared/stores/formConfig'
import { formConfig as fullFormConfig } from './api-sample-response-form-config'
import { products as fullProducts } from './api-sample-response-products'

/**
 * Sample forms for campaigns
 * Each campaign can have multiple forms with different configurations
 */

// Full-featured form configuration
const fullFeaturedConfigOrangutan = {
  ...fullFormConfig,
  campaignId: 'adopt-orangutan'
}

// Full-featured form configuration for P2P template
const fullFeaturedConfigBirthday = {
  ...fullFormConfig,
  form: {
    title: 'Make a Birthday Donation',
    subtitle: 'Help make a difference this birthday'
  },
  campaignId: 'birthday-p2p-template'
}

// Full-featured form configuration for Wild Amer's fundraiser 1
const fullFeaturedConfigWildAmer1 = {
  ...fullFormConfig,
  form: {
    title: "Support Wild's Birthday Fundraiser",
    subtitle: 'Help Wild reach their goal'
  },
  campaignId: 'wild-amer-birthday-fundraiser'
}

// Full-featured form configuration for Wild Amer's fundraiser 2
const fullFeaturedConfigWildAmer2 = {
  ...fullFormConfig,
  form: {
    title: "Support Wild's Mini Campaign",
    subtitle: 'Every donation counts'
  },
  campaignId: 'wild-amer-birthday-2-fundraiser'
}

// Minimal form configuration (most features disabled)
const minimalFormConfig = {
  version: '1.0',
  campaignId: 'adopt-orangutan',
  form: {
    title: 'Quick Donation',
    subtitle: 'Support orangutan conservation'
  },
  donationAmounts: {
    baseDefaultCurrency: 'GBP',
    frequencies: {
      once: {
        enabled: true,
        label: 'One-time',
        presetAmounts: [{ amount: 10 }, { amount: 25 }, { amount: 50 }, { amount: 100 }],
        customAmount: { min: 5, max: 1000 }
      },
      monthly: {
        enabled: false,
        label: 'Monthly',
        presetAmounts: [{ amount: 5 }, { amount: 10 }, { amount: 25 }, { amount: 50 }],
        customAmount: { min: 3, max: 500 }
      },
      yearly: {
        enabled: false,
        label: 'Yearly',
        presetAmounts: [{ amount: 50 }, { amount: 100 }, { amount: 250 }, { amount: 500 }],
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
    impactBoost: {
      enabled: false,
      messages: {
        recurringBoostMessage: '',
        increaseBoostMessage: ''
      },
      upsells: {
        enableRecurringBoost: false,
        enableIncreaseBoost: false
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
    config: fullFeaturedConfigOrangutan as unknown as FullFormConfig,
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
 * Forms for "Birthday P2P Template" campaign
 */
export const birthdayP2PForms: CampaignForm[] = [
  {
    id: 'form-birthday-full',
    campaignId: 'birthday-p2p-template',
    name: 'Full Experience Form',
    isDefault: true,
    config: fullFeaturedConfigBirthday as unknown as FullFormConfig,
    products: fullProducts,
    createdAt: '2025-11-01T10:00:00Z',
    updatedAt: '2026-01-10T14:30:00Z'
  }
]

/**
 * Forms for Wild Amer's first fundraiser campaign
 */
export const wildAmer1FundraiserForms: CampaignForm[] = [
  {
    id: 'form-wild-amer-1-full',
    campaignId: 'wild-amer-birthday-fundraiser',
    name: 'Full Experience Form',
    isDefault: true,
    config: fullFeaturedConfigWildAmer1 as unknown as FullFormConfig,
    products: fullProducts,
    createdAt: '2025-11-15T10:00:00Z',
    updatedAt: '2026-01-15T14:30:00Z'
  }
]

/**
 * Forms for Wild Amer's second fundraiser campaign
 */
export const wildAmer2FundraiserForms: CampaignForm[] = [
  {
    id: 'form-wild-amer-2-full',
    campaignId: 'wild-amer-birthday-2-fundraiser',
    name: 'Full Experience Form',
    isDefault: true,
    config: fullFeaturedConfigWildAmer2 as unknown as FullFormConfig,
    products: fullProducts,
    createdAt: '2025-12-20T10:00:00Z',
    updatedAt: '2026-01-10T14:30:00Z'
  }
]

/**
 * Get all forms for a specific campaign
 */
export function getFormsByCampaignId(campaignId: string): CampaignForm[] {
  switch (campaignId) {
    case 'adopt-orangutan':
      return adoptOrangutanForms
    case 'birthday-p2p-template':
      return birthdayP2PForms
    case 'wild-amer-birthday-fundraiser':
      return wildAmer1FundraiserForms
    case 'wild-amer-birthday-2-fundraiser':
      return wildAmer2FundraiserForms
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
  const allForms = [...adoptOrangutanForms]
  return allForms.find((form) => form.id === formId)
}
