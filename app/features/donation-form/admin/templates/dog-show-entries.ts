import type { FullFormConfig } from '~/features/donation-form/shared/stores/formConfig'
import type { Product } from '~/features/donation-form/features/product/shared/types'

/**
 * Dog Show Entries Template
 * Shared entry fields for competition categories (one dog, many classes)
 * Multiple products enabled, donation-only features disabled
 */
export function createDogShowEntriesTemplate(
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
        title: 'Enter the Show',
        subtitle: 'Select your competition categories',
        formType: 'registration'
      },
      donationAmounts: {
        baseDefaultCurrency: defaultCurrency,
        frequencies: {
          once: {
            enabled: true,
            label: 'One-time',
            presetAmounts: [{ amount: 3 }, { amount: 5 }, { amount: 10 }],
            customAmount: { min: 1, max: 10000 }
          },
          monthly: {
            enabled: false,
            label: 'Monthly',
            presetAmounts: [{ amount: 5 }],
            customAmount: { min: 1, max: 5000 }
          },
          yearly: {
            enabled: false,
            label: 'Yearly',
            presetAmounts: [{ amount: 25 }],
            customAmount: { min: 5, max: 10000 }
          }
        }
      },
      features: {
        impactCart: {
          enabled: true,
          settings: { initialDisplay: 6 }
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
          showForOnceFrequency: false,
          icons: { gift: '🎁', memorial: '🕊️', tribute: '💝' },
          types: { none: { label: 'No, thank you' }, giftEnabled: false, memorialEnabled: false },
          relationships: [],
          modal: { title: '', subtitle: '' }
        },
        customFields: { customFieldsTabs: {} }
      }
    },
    products: [
      {
        id: 'template-best-in-show',
        name: 'Best in Show',
        title: 'Best in Show',
        description: 'Overall champion judged on appearance and temperament.',
        price: 2.5,
        frequency: 'once',
        image: null
      },
      {
        id: 'template-cutest-puppy',
        name: 'Cutest Puppy',
        title: 'Cutest Puppy',
        description: 'Puppies under 12 months — cutest face wins!',
        price: 2.5,
        frequency: 'once',
        image: null
      },
      {
        id: 'template-waggiest-tail',
        name: 'Waggiest Tail',
        title: 'Waggiest Tail',
        description: 'The happiest tail wins the prize!',
        price: 2.5,
        frequency: 'once',
        image: null
      }
    ]
  }
}
