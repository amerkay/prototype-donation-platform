export const formConfig = {
  version: '1.0',
  form: {
    title: 'Make a Donation',
    subtitle: 'Choose your donation amount'
  },
  localization: {
    defaultCurrency: 'GBP',
    supportedCurrencies: ['USD', 'EUR', 'GBP']
  },
  pricing: {
    baseCurrency: 'GBP',
    frequencies: {
      once: {
        enabled: true,
        label: 'One-time',
        presetAmounts: [10, 25, 50, 100, 250, 500],
        customAmount: { min: 5, max: 1000 }
      },
      monthly: {
        enabled: true,
        label: 'Monthly',
        presetAmounts: [5, 10, 25, 50, 75, 100],
        customAmount: { min: 3, max: 500 }
      },
      yearly: {
        enabled: false,
        label: 'Yearly',
        presetAmounts: [50, 100, 250, 500, 1000, 1500],
        customAmount: { min: 25, max: 2000 }
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
    impactJourney: {
      enabled: true,
      messaging: {
        emoji: '❤️',
        onceHeadline: 'Your Support Today',
        monthlyHeadline: "Every Day You're There",
        yearlyHeadline: "Every Day You're There"
      },
      impactPerAmount: {
        items: [
          { amount: 3, label: 'Fresh fruit' },
          { amount: 10, label: 'Medical checkup' },
          { amount: 15, label: 'Enrichment toys' },
          { amount: 25, label: 'Complete care' },
          { amount: 50, label: 'Multiple orangutans' },
          { amount: 75, label: 'Rescue equipment' },
          { amount: 100, label: 'Habitat protection' }
        ]
      },
      upsells: {
        upsellOnceToRecurring: true,
        upsellCtaCopy: 'Be Their Constant',
        upsellIncreaseAmount: true,
        upsellIncreaseCtaCopy: 'Greater Impact'
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
      enabled: false,
      fields: [
        {
          id: 'company_name',
          type: 'text',
          label: 'Company Name',
          fieldConfig: {
            optional: false,
            placeholder: 'Enter your company name',
            // defaultValue: 'Wildlife Foundation',
            maxLength: 100
          }
        },
        {
          id: 'dedication_message',
          type: 'textarea',
          label: 'Dedication Message',
          fieldConfig: {
            optional: false,
            placeholder: 'Write a personal message...',
            // defaultValue: 'In honor of...',
            rows: 4,
            maxLength: 500
          }
        },
        {
          id: 'involvement_level',
          type: 'slider',
          label: 'How involved do you want to be?',
          fieldConfig: {
            optional: false,
            min: 0,
            max: 100,
            step: 10,
            // defaultValue: 50,
            suffix: '%'
          }
        },
        {
          id: 'hear_about_us',
          type: 'select',
          label: 'How did you hear about us?',
          fieldConfig: {
            optional: false,
            placeholder: 'Select an option',
            // defaultValue: 'event_or_conference',
            options: [
              'Search Engine',
              'Social Media',
              'Friend or Family',
              'Event or Conference',
              'Other'
            ]
          }
        },
        {
          id: 'utm_source',
          type: 'hidden',
          label: 'UTM Source',
          fieldConfig: {
            defaultValue: 'website'
          }
        }
      ]
    }
  }
}
