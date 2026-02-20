import type { FullFormConfig } from '~/features/donation-form/shared/stores/formConfig'
import type { Product } from '~/features/donation-form/features/product/shared/types'

/**
 * Stall Booking Template
 * Per-item entry fields for market/fete stall bookings
 * Multiple products enabled, donation-only features disabled
 */
export function createStallBookingTemplate(
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
        title: 'Book a Stall',
        subtitle: 'Reserve your stall for the event',
        formType: 'registration'
      },
      donationAmounts: {
        baseDefaultCurrency: defaultCurrency,
        frequencies: {
          once: {
            enabled: true,
            label: 'One-time',
            presetAmounts: [{ amount: 25 }, { amount: 50 }, { amount: 100 }],
            customAmount: { min: 5, max: 10000 }
          },
          monthly: {
            enabled: false,
            label: 'Monthly',
            presetAmounts: [{ amount: 25 }],
            customAmount: { min: 5, max: 5000 }
          },
          yearly: {
            enabled: false,
            label: 'Yearly',
            presetAmounts: [{ amount: 100 }],
            customAmount: { min: 25, max: 10000 }
          }
        }
      },
      features: {
        impactCart: {
          enabled: true,
          settings: { initialDisplay: 3 }
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
        id: 'template-standard-stall',
        name: 'Standard Stall',
        title: 'Standard Stall (3m x 3m)',
        description: 'Indoor stall with table and two chairs.',
        price: 25,
        frequency: 'once',
        image: null
      },
      {
        id: 'template-large-stall',
        name: 'Large Stall',
        title: 'Large Stall (3m x 6m)',
        description: 'Double-width stall with extra display space.',
        price: 45,
        frequency: 'once',
        image: null
      },
      {
        id: 'template-corner-stall',
        name: 'Corner Stall',
        title: 'Corner Stall (3m x 3m)',
        description: 'Prime corner position with two open sides.',
        price: 35,
        frequency: 'once',
        image: null
      }
    ]
  }
}
