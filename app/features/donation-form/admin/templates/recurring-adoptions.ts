import type { FullFormConfig } from '~/features/donation-form/shared/stores/formConfig'
import type { Product } from '~/features/donation-form/features/product/shared/types'

/**
 * Recurring Symbolic Adoptions Template
 * Product selector enabled for symbolic orangutan adoptions
 */
export function createRecurringAdoptionsTemplate(
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
        title: 'Adopt an Orangutan',
        subtitle: 'Choose an orangutan to support with monthly donations'
      },
      donationAmounts: {
        baseDefaultCurrency: defaultCurrency,
        frequencies: {
          once: {
            enabled: false,
            label: 'One-time',
            presetAmounts: [{ amount: 10 }],
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
            enabled: true,
            label: 'Yearly',
            presetAmounts: [
              { amount: 50 },
              { amount: 100 },
              { amount: 250 },
              { amount: 500 },
              { amount: 1000 },
              { amount: 2500 }
            ],
            customAmount: { min: 25, max: 50000 }
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
          enabled: true,
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
          enabled: true,
          showForOnceFrequency: false,
          icons: {
            gift: '🎁',
            memorial: '🕊️',
            tribute: '💝'
          },
          types: {
            none: { label: 'No, thank you' },
            giftEnabled: true,
            memorialEnabled: false
          },
          relationships: [
            { value: 'mother', label: 'Mother' },
            { value: 'father', label: 'Father' },
            { value: 'spouse', label: 'Spouse' },
            { value: 'child', label: 'Child' },
            { value: 'friend', label: 'Friend' },
            { value: 'other', label: 'Other' }
          ],
          modal: {
            title: 'Gift Adoption',
            subtitle: 'Make this adoption a gift for someone special'
          }
        },
        customFields: {
          customFieldsTabs: {}
        }
      }
    },
    products: [
      {
        id: 'adopt-bumi',
        name: 'Adopt Bumi the Orangutan',
        description: "Monthly sponsorship to support Bumi's care and rehabilitation",
        minPrice: 3,
        default: 10,
        frequency: 'monthly',
        image: '🦧',
        thumbnail: '🦧',
        icon: '🦧'
      },
      {
        id: 'adopt-maya',
        name: 'Adopt Maya the Orangutan',
        description: "Monthly sponsorship for Maya's ongoing medical care",
        minPrice: 3,
        default: 10,
        frequency: 'monthly',
        image: '🦧',
        thumbnail: '🦧',
        icon: '🦧'
      },
      {
        id: 'adopt-kiko',
        name: 'Adopt Kiko the Orangutan',
        description: 'Support Kiko as he prepares for release back to the wild',
        minPrice: 3,
        default: 10,
        frequency: 'monthly',
        image: '🦧',
        thumbnail: '🦧',
        icon: '🦧'
      }
    ]
  }
}
