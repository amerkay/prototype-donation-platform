import type { FullFormConfig } from '~/features/donation-form/shared/stores/formConfig'
import type { Product } from '~/features/donation-form/features/product/shared/types'

/**
 * Basic Template
 * Minimal configuration with only one-time and monthly donations
 * All features disabled
 */
export function createBasicTemplate(
  _campaignId: string,
  defaultCurrency: string
): {
  config: FullFormConfig
  products: Product[]
} {
  return {
    config: {
      version: '1.0',
      form: {
        title: 'Support Orangutan Conservation',
        subtitle: 'Choose your donation amount'
      },
      donationAmounts: {
        baseDefaultCurrency: defaultCurrency,
        frequencies: {
          once: {
            enabled: true,
            label: 'One-time',
            presetAmounts: [
              { amount: 10 },
              { amount: 25 },
              { amount: 50 },
              { amount: 100 },
              { amount: 250 },
              { amount: 500 }
            ],
            customAmount: { min: 5, max: 10000 }
          },
          monthly: {
            enabled: true,
            label: 'Monthly',
            presetAmounts: [
              { amount: 5 },
              { amount: 10 },
              { amount: 25 },
              { amount: 50 },
              { amount: 100 },
              { amount: 250 }
            ],
            customAmount: { min: 3, max: 5000 }
          },
          yearly: {
            enabled: false,
            label: 'Yearly',
            presetAmounts: [{ amount: 50 }],
            customAmount: { min: 25, max: 10000 }
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
          showForOnceFrequency: false,
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
        },
        entryFields: { enabled: false, mode: 'shared' as const, fields: [] },
        terms: { enabled: true },
        contactConsent: {
          enabled: true,
          settings: {
            label: 'Join our email list',
            description: 'Get updates on our impact and latest news. Unsubscribe anytime.'
          }
        }
      }
    },
    products: []
  }
}
