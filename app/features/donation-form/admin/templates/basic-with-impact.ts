import type { FullFormConfig } from '~/features/donation-form/shared/stores/formConfig'
import type { Product } from '~/features/donation-form/features/product/shared/types'

/**
 * Basic with Impact Statements Template
 * One-time and monthly donations with impact descriptions
 */
export function createBasicWithImpactTemplate(
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
        subtitle: 'See the impact of your donation'
      },
      donationAmounts: {
        baseDefaultCurrency: defaultCurrency,
        frequencies: {
          once: {
            enabled: true,
            label: 'One-time',
            enableAmountDescriptions: true,
            presetAmounts: [
              {
                amount: 10,
                shortText: 'Fresh fruit for a week',
                image: '/imgs/orangutan-felix-square.jpg'
              },
              {
                amount: 25,
                shortText: 'Medical checkup',
                image: '/imgs/orangutan-felix-square.jpg'
              },
              {
                amount: 50,
                shortText: 'Enrichment toys',
                image: '/imgs/orangutan-felix-square.jpg'
              },
              {
                amount: 100,
                shortText: 'Complete care package',
                image: '/imgs/orangutan-felix-square.jpg'
              },
              {
                amount: 250,
                shortText: 'Care for multiple orangutans',
                image: '/imgs/orangutan-felix-square.jpg'
              },
              {
                amount: 500,
                shortText: 'Rescue equipment',
                image: '/imgs/orangutan-felix-square.jpg'
              }
            ],
            customAmount: { min: 5, max: 10000 }
          },
          monthly: {
            enabled: true,
            label: 'Monthly',
            enableAmountDescriptions: true,
            presetAmounts: [
              {
                amount: 5,
                shortText: 'Daily fresh fruit',
                image: '/imgs/orangutan-felix-square.jpg'
              },
              {
                amount: 10,
                shortText: 'Weekly medical care',
                image: '/imgs/orangutan-felix-square.jpg'
              },
              {
                amount: 25,
                shortText: 'Full monthly support',
                image: '/imgs/orangutan-felix-square.jpg'
              },
              {
                amount: 50,
                shortText: 'Advanced rehabilitation',
                image: '/imgs/orangutan-felix-square.jpg'
              },
              {
                amount: 100,
                shortText: 'Support two orangutans',
                image: '/imgs/orangutan-felix-square.jpg'
              },
              {
                amount: 250,
                shortText: 'Habitat protection',
                image: '/imgs/orangutan-felix-square.jpg'
              }
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
