import type { CampaignForm } from '~/features/campaigns/shared/types'
import type { FullFormConfig } from '~/features/donation-form/shared/stores/formConfig'
import { formConfig as fullFormConfig } from './api-sample-response-form-config'
import {
  products as fullProducts,
  stallBookingProducts,
  dogShowProducts,
  classicCarProducts
} from './api-sample-response-products'

/**
 * Sample forms for campaigns
 * Each campaign has a single form (1:1 campaign:form)
 */

// Full-featured form configuration
const fullFeaturedConfigOrangutan = {
  ...fullFormConfig
}

// Full-featured form configuration for P2P template
const fullFeaturedConfigBirthday = {
  ...fullFormConfig,
  form: {
    ...fullFormConfig.form,
    title: 'Make a Birthday Donation',
    subtitle: 'Help make a difference this birthday'
  }
}

// Full-featured form configuration for Tribute P2P template
const fullFeaturedConfigTribute = {
  ...fullFormConfig,
  form: {
    ...fullFormConfig.form,
    title: 'Make a Tribute Donation',
    subtitle: 'Honour a loved one with a meaningful gift'
  }
}

// Full-featured form configuration for Challenge P2P template
const fullFeaturedConfigChallenge = {
  ...fullFormConfig,
  form: {
    ...fullFormConfig.form,
    title: 'Sponsor a Challenge',
    subtitle: 'Support a fundraiser taking on a personal challenge'
  }
}

// Full-featured form configuration for Wedding P2P template
const fullFeaturedConfigWedding = {
  ...fullFormConfig,
  form: {
    ...fullFormConfig.form,
    title: 'Make a Wedding Donation',
    subtitle: 'Celebrate love by giving back'
  }
}

// Full-featured form configuration for Wild Amer's fundraiser 1
const fullFeaturedConfigWildAmer1 = {
  ...fullFormConfig,
  form: {
    ...fullFormConfig.form,
    title: "Support Wild's Birthday Fundraiser",
    subtitle: 'Help Wild reach their goal'
  }
}

// Full-featured form configuration for Wild Amer's fundraiser 2
const fullFeaturedConfigWildAmer2 = {
  ...fullFormConfig,
  form: {
    ...fullFormConfig.form,
    title: "Support Wild's Mini Campaign",
    subtitle: 'Every donation counts'
  }
}

// Full-featured form configuration for Matched Giving
const fullFeaturedConfigMatchedGiving = {
  ...fullFormConfig,
  form: {
    ...fullFormConfig.form,
    title: 'Double Your Impact',
    subtitle: 'Every pound matched by The Wilkinson Foundation'
  }
}

// --- Non-donation form configurations ---

/** Shared disabled features for non-donation forms */
const disabledDonationFeatures = {
  impactBoost: {
    enabled: false,
    messages: { recurringBoostMessage: '', increaseBoostMessage: '' },
    upsells: { enableRecurringBoost: false, enableIncreaseBoost: false }
  },
  coverCosts: {
    enabled: false,
    settings: { heading: '', description: '', defaultPercentage: 0 }
  },
  giftAid: { enabled: false },
  tribute: {
    enabled: false,
    icons: { gift: '', memorial: '', tribute: '' },
    types: { none: { label: '' }, giftEnabled: false, memorialEnabled: false },
    relationships: [],
    modal: { title: '', subtitle: '' }
  },
  customFields: { customFieldsTabs: {} }
}

/** Minimal donationAmounts for non-donation forms (unused but structurally required) */
const minimalDonationAmounts = {
  baseDefaultCurrency: 'GBP',
  enabledCurrencies: ['GBP', 'USD', 'EUR'],
  frequencies: {
    once: {
      enabled: true,
      label: 'One-time',
      presetAmounts: [] as { amount: number }[],
      customAmount: { min: 0, max: 1000 }
    },
    monthly: {
      enabled: false,
      label: 'Monthly',
      presetAmounts: [] as { amount: number }[],
      customAmount: { min: 0, max: 500 }
    },
    yearly: {
      enabled: false,
      label: 'Yearly',
      presetAmounts: [] as { amount: number }[],
      customAmount: { min: 0, max: 2000 }
    }
  }
}

const stallBookingFormConfig = {
  version: '1.0',
  form: {
    title: 'Book a Stall',
    subtitle: 'Reserve your stall for the Summer Fete 2026'
  },
  donationAmounts: minimalDonationAmounts,
  features: {
    impactCart: {
      enabled: true,
      settings: {
        initialDisplay: 3,
        quantityRemaining: {
          'stall-standard': 94,
          'stall-large': 4,
          'stall-corner': 8
        }
      }
    },
    productSelector: {
      enabled: true,
      config: {
        icon: '🏪',
        entity: { singular: 'Stall', plural: 'Stalls' },
        action: { verb: 'Book', noun: 'booking' }
      }
    },
    entryFields: {
      enabled: true,
      mode: 'per-item' as const,
      fields: [
        {
          type: 'text' as const,
          id: 'holder_name',
          label: 'Stall Holder Name',
          placeholder: 'Your full name'
        },
        {
          type: 'text' as const,
          id: 'business_name',
          label: 'Business / Organisation',
          optional: true,
          placeholder: 'Business or org name'
        },
        {
          type: 'textarea' as const,
          id: 'goods_description',
          label: 'What Will You Be Selling?',
          placeholder: 'Brief description of your goods or services'
        },
        { type: 'checkbox' as const, id: 'power_required', label: 'Mains power supply needed' }
      ]
    },
    contactConsent: {
      enabled: true,
      settings: {
        label: 'Keep me updated about future events',
        description: "We'll send occasional updates about upcoming fetes and community events."
      }
    },
    terms: { enabled: true },
    ...disabledDonationFeatures
  }
}

const dogShowFormConfig = {
  version: '1.0',
  form: {
    title: 'Enter the Dog Show',
    subtitle: 'Pick your categories — £2.50 per entry'
  },
  donationAmounts: minimalDonationAmounts,
  features: {
    impactCart: {
      enabled: true,
      settings: {
        initialDisplay: 6,
        quantityRemaining: {
          'dog-best-in-show': 50,
          'dog-cutest-puppy': 30
        }
      }
    },
    productSelector: {
      enabled: true,
      config: {
        icon: '🐕',
        entity: { singular: 'Category', plural: 'Categories' },
        action: { verb: 'Enter', noun: 'entry' }
      }
    },
    entryFields: {
      enabled: true,
      mode: 'shared' as const,
      fields: [
        {
          type: 'text' as const,
          id: 'dog_name',
          label: 'Dog Name',
          placeholder: "Your dog's name"
        },
        {
          type: 'text' as const,
          id: 'breed',
          label: 'Breed',
          placeholder: 'e.g., Labrador, Mixed'
        },
        {
          type: 'text' as const,
          id: 'handler_name',
          label: 'Handler Name',
          placeholder: 'Person showing the dog'
        }
      ]
    },
    contactConsent: {
      enabled: true,
      settings: {
        label: 'Keep me updated about future shows',
        description: "We'll let you know about upcoming dog shows and events."
      }
    },
    terms: { enabled: false },
    ...disabledDonationFeatures
  }
}

const classicCarFormConfig = {
  version: '1.0',
  form: {
    title: 'Register Your Classic Car',
    subtitle: 'Free entry — all classic cars welcome'
  },
  donationAmounts: minimalDonationAmounts,
  features: {
    impactCart: { enabled: true, settings: { initialDisplay: 1 } },
    productSelector: {
      enabled: true,
      config: {
        icon: '🚗',
        entity: { singular: 'Entry', plural: 'Entries' },
        action: { verb: 'Register', noun: 'registration' }
      }
    },
    entryFields: { enabled: false, mode: 'shared' as const, fields: [] },
    contactConsent: {
      enabled: true,
      settings: {
        label: 'Keep me updated about classic car events',
        description: 'Occasional updates about shows and meetups in your area.'
      }
    },
    terms: { enabled: false },
    ...disabledDonationFeatures
  }
}

// --- Single form exports (1:1 campaign:form) ---

export const adoptOrangutanForm: CampaignForm = {
  id: 'form-orangutan-full',
  campaignId: 'adopt-orangutan',
  name: 'Full Experience Form',
  isDefault: true,
  config: fullFeaturedConfigOrangutan as unknown as FullFormConfig,
  products: fullProducts,
  createdAt: '2024-01-15T10:00:00Z',
  updatedAt: '2024-12-15T14:30:00Z'
}

export const birthdayP2PForm: CampaignForm = {
  id: 'form-birthday-full',
  campaignId: 'birthday-p2p-template',
  name: 'Full Experience Form',
  isDefault: true,
  config: fullFeaturedConfigBirthday as unknown as FullFormConfig,
  products: fullProducts,
  createdAt: '2025-11-01T10:00:00Z',
  updatedAt: '2026-01-10T14:30:00Z'
}

export const tributeP2PForm: CampaignForm = {
  id: 'form-tribute-full',
  campaignId: 'tribute-p2p-template',
  name: 'Full Experience Form',
  isDefault: true,
  config: fullFeaturedConfigTribute as unknown as FullFormConfig,
  products: fullProducts,
  createdAt: '2025-10-01T10:00:00Z',
  updatedAt: '2026-01-12T14:30:00Z'
}

export const challengeP2PForm: CampaignForm = {
  id: 'form-challenge-full',
  campaignId: 'challenge-p2p-template',
  name: 'Full Experience Form',
  isDefault: true,
  config: fullFeaturedConfigChallenge as unknown as FullFormConfig,
  products: fullProducts,
  createdAt: '2025-09-15T10:00:00Z',
  updatedAt: '2026-01-08T14:30:00Z'
}

export const weddingP2PForm: CampaignForm = {
  id: 'form-wedding-full',
  campaignId: 'wedding-p2p-template',
  name: 'Full Experience Form',
  isDefault: true,
  config: fullFeaturedConfigWedding as unknown as FullFormConfig,
  products: fullProducts,
  createdAt: '2025-08-01T10:00:00Z',
  updatedAt: '2026-01-05T14:30:00Z'
}

export const wildAmer1FundraiserForm: CampaignForm = {
  id: 'form-wild-amer-1-full',
  campaignId: 'wild-amer-birthday-fundraiser',
  name: 'Full Experience Form',
  isDefault: true,
  config: fullFeaturedConfigWildAmer1 as unknown as FullFormConfig,
  products: fullProducts,
  createdAt: '2025-11-15T10:00:00Z',
  updatedAt: '2026-01-15T14:30:00Z'
}

export const wildAmer2FundraiserForm: CampaignForm = {
  id: 'form-wild-amer-2-full',
  campaignId: 'wild-amer-birthday-2-fundraiser',
  name: 'Full Experience Form',
  isDefault: true,
  config: fullFeaturedConfigWildAmer2 as unknown as FullFormConfig,
  products: fullProducts,
  createdAt: '2025-12-20T10:00:00Z',
  updatedAt: '2026-01-10T14:30:00Z'
}

export const matchedGivingForm: CampaignForm = {
  id: 'form-matched-giving',
  campaignId: 'matched-giving-spring',
  name: 'Matched Giving Form',
  isDefault: true,
  config: fullFeaturedConfigMatchedGiving as unknown as FullFormConfig,
  products: fullProducts,
  createdAt: '2026-02-01T10:00:00Z',
  updatedAt: '2026-02-15T14:30:00Z'
}

export const stallBookingForm: CampaignForm = {
  id: 'form-stall-booking',
  campaignId: 'summer-fete-stalls',
  name: 'Stall Booking Form',
  isDefault: true,
  config: stallBookingFormConfig as unknown as FullFormConfig,
  products: stallBookingProducts,
  createdAt: '2026-01-05T09:00:00Z',
  updatedAt: '2026-02-01T11:00:00Z'
}

export const dogShowForm: CampaignForm = {
  id: 'form-dog-show',
  campaignId: 'annual-dog-show',
  name: 'Dog Show Entry Form',
  isDefault: true,
  config: dogShowFormConfig as unknown as FullFormConfig,
  products: dogShowProducts,
  createdAt: '2026-01-10T09:00:00Z',
  updatedAt: '2026-02-05T11:00:00Z'
}

export const classicCarForm: CampaignForm = {
  id: 'form-classic-car',
  campaignId: 'classic-car-show',
  name: 'Classic Car Registration',
  isDefault: true,
  config: classicCarFormConfig as unknown as FullFormConfig,
  products: classicCarProducts,
  createdAt: '2026-01-12T09:00:00Z',
  updatedAt: '2026-02-08T11:00:00Z'
}
