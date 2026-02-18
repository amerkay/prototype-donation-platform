import type { FullFormConfig } from '~/features/donation-form/shared/stores/formConfig'
import type { Product } from '~/features/donation-form/features/product/shared/types'

/**
 * Multiple Products Template
 * Impact cart enabled with multiple products for donation
 */
export function createMultipleProductsTemplate(
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
        title: 'Build Your Impact Cart',
        subtitle: 'Select items to support orangutan conservation'
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
          enabled: true,
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
          enabled: true,
          settings: {
            heading: 'Send 100% to the Orangutans',
            description:
              'By covering operational costs, your entire donation protects orangutans and their habitat.',
            defaultPercentage: 10
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
        entryFields: { enabled: false, mode: 'shared' as const, fields: [] }
      }
    },
    products: [
      {
        id: 'tree-planting',
        name: 'Plant 10 Trees',
        description: 'Help restore orangutan habitat with native tree planting',
        price: 30,
        frequency: 'once',
        image: '🌳',
        thumbnail: '🌳',
        icon: '🌳'
      },
      {
        id: 'education-program',
        name: 'Support Education Program',
        description: 'Monthly contribution to local conservation education',
        minPrice: 5,
        default: 25,
        frequency: 'monthly',
        image: '📚',
        thumbnail: '📚',
        icon: '📚'
      },
      {
        id: 'rescue-kit',
        name: 'Emergency Rescue Kit',
        description: 'Provide equipment for orangutan rescue operations',
        price: 75,
        frequency: 'once',
        image: '🚑',
        thumbnail: '🚑',
        icon: '🚑'
      },
      {
        id: 'medical-supplies',
        name: 'Medical Supplies',
        description: 'Monthly support for veterinary care and medical supplies',
        minPrice: 10,
        default: 40,
        frequency: 'monthly',
        image: '💊',
        thumbnail: '💊',
        icon: '💊'
      }
    ]
  }
}
