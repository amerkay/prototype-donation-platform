import type { FullFormConfig } from '~/features/donation-form/shared/stores/formConfig'
import type { Product } from '~/features/donation-form/features/product/shared/types'

/**
 * Registration Template
 * Per-item entry fields for event registrations
 * Multiple products enabled, donation-only features disabled
 */
export function createRegistrationTemplate(
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
        title: 'Register',
        subtitle: 'Complete your registration',
        formType: 'registration'
      },
      donationAmounts: {
        baseDefaultCurrency: defaultCurrency,
        frequencies: {
          once: {
            enabled: true,
            label: 'One-time',
            presetAmounts: [{ amount: 10 }, { amount: 25 }, { amount: 50 }],
            customAmount: { min: 5, max: 10000 }
          },
          monthly: {
            enabled: false,
            label: 'Monthly',
            presetAmounts: [{ amount: 5 }],
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
          enabled: true,
          settings: {
            initialDisplay: 3
          }
        },
        productSelector: {
          enabled: false,
          config: {
            icon: '📋',
            entity: { singular: 'Registration', plural: 'Registrations' },
            action: { verb: 'Register', noun: 'registration' }
          }
        },
        impactBoost: {
          enabled: false,
          messages: { recurringBoostMessage: '', increaseBoostMessage: '' },
          upsells: { enableRecurringBoost: false, enableIncreaseBoost: false }
        },
        coverCosts: {
          enabled: false,
          settings: {
            heading: 'Cover processing costs',
            description: 'Help us cover transaction fees',
            defaultPercentage: 0
          }
        },
        giftAid: { enabled: false },
        tribute: {
          enabled: false,
          showForOnceFrequency: false,
          icons: { gift: '🎁', memorial: '🕊️', tribute: '💝' },
          types: { none: { label: 'No, thank you' }, giftEnabled: false, memorialEnabled: false },
          relationships: [],
          modal: { title: 'Gift or In Memory', subtitle: '' }
        },
        customFields: { customFieldsTabs: {} },
        entryFields: { enabled: true, mode: 'per-item' as const, fields: [] }
      }
    },
    products: []
  }
}
