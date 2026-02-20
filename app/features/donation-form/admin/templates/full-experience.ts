import type { FullFormConfig } from '~/features/donation-form/shared/stores/formConfig'
import type { Product } from '~/features/donation-form/features/product/shared/types'

/**
 * Full Experience Template
 * All features enabled (except impact statements)
 * Comprehensive donation experience with all options
 */
export function createFullExperienceTemplate(
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
        title: 'Make a Donation',
        subtitle: 'Choose your donation amount'
      },
      donationAmounts: {
        baseDefaultCurrency: defaultCurrency,
        frequencies: {
          once: {
            enabled: true,
            label: 'One-time',
            enableAmountDescriptions: false,
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
              { amount: 75 },
              { amount: 100 }
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
              { amount: 1500 }
            ],
            customAmount: { min: 25, max: 50000 }
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
          enabled: true,
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
              'Your monthly gift means they can count on you every single day ❤️',
            increaseBoostMessage: 'A little more today creates lasting change tomorrow ❤️'
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
            { value: 'parent', label: 'Parent' },
            { value: 'spouse', label: 'Spouse' },
            { value: 'partner', label: 'Partner' },
            { value: 'sibling', label: 'Sibling' },
            { value: 'child', label: 'Child' },
            { value: 'grandparent', label: 'Grandparent' },
            { value: 'grandchild', label: 'Grandchild' },
            { value: 'friend', label: 'Friend' },
            { value: 'colleague', label: 'Colleague' },
            { value: 'teacher', label: 'Teacher' },
            { value: 'mentor', label: 'Mentor' },
            { value: 'other', label: 'Other' }
          ],
          modal: {
            title: 'Gift or In Memory',
            subtitle: 'Make this donation in honor or memory of someone special'
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
        id: 'adopt-bumi',
        name: 'Adopt Bumi',
        title: 'Adopt Bumi the Orangutan',
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
        name: 'Adopt Maya',
        title: 'Adopt Maya the Orangutan',
        description: "Monthly sponsorship for Maya's ongoing medical care",
        minPrice: 3,
        default: 10,
        frequency: 'monthly',
        image: '🦧',
        thumbnail: '🦧',
        icon: '🦧'
      },
      {
        id: 'tree-planting',
        name: 'Tree Planting',
        title: 'Plant 10 Trees',
        description: 'Help restore orangutan habitat with native tree planting',
        price: 30,
        frequency: 'once',
        image: '🌳',
        thumbnail: '🌳',
        icon: '🌳'
      },
      {
        id: 'education-program',
        name: 'Education Program',
        title: 'Support Education Program',
        description: 'Monthly contribution to local conservation education',
        minPrice: 5,
        default: 25,
        frequency: 'monthly',
        image: '📚',
        thumbnail: '📚',
        icon: '📚'
      }
    ]
  }
}
