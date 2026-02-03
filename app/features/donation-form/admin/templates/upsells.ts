import type { FullFormConfig } from '~/features/donation-form/shared/stores/formConfig'
import type { Product } from '~/features/donation-form/features/product/shared/types'

/**
 * Upsells Template
 * Features recurring and increase boost upsells enabled
 */
export function createUpsellsTemplate(
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
        title: 'Make an Impact for Orangutans',
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
          enabled: false,
          config: {
            icon: '🦧',
            entity: { singular: 'Orangutan', plural: 'Orangutans' },
            action: { verb: 'Adopt', noun: 'adoption' }
          }
        },
        impactBoost: {
          enabled: true,
          messages: {
            recurringBoostMessage:
              'Your monthly gift means they can count on you every single day 🦧❤️',
            increaseBoostMessage: 'A little more today creates lasting change tomorrow 🌳'
          },
          upsells: {
            enableRecurringBoost: true,
            enableIncreaseBoost: true
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
          showForOnceFrequency: true,
          icons: {
            gift: '🎁',
            memorial: '🕊️',
            tribute: '💝'
          },
          types: {
            none: { label: 'No, thank you' },
            giftEnabled: true,
            memorialEnabled: true
          },
          relationships: [
            { value: 'mother', label: 'Mother' },
            { value: 'father', label: 'Father' },
            { value: 'spouse', label: 'Spouse' },
            { value: 'friend', label: 'Friend' },
            { value: 'other', label: 'Other' }
          ],
          modal: {
            title: 'Gift or In Memory',
            subtitle: 'Make this donation in honor or memory of someone special'
          }
        },
        customFields: {
          customFieldsTabs: {}
        }
      }
    },
    products: []
  }
}
