export const formConfig = {
  version: '1.0',
  form: {
    title: 'Make a Donation',
    subtitle: 'Choose your donation amount'
  },
  localization: {
    defaultCurrency: 'EUR',
    supportedCurrencies: ['USD', 'EUR', 'GBP']
  },
  pricing: {
    baseCurrency: 'EUR',
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
        presetAmounts: [50, 100, 250, 500, 1000],
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
        icon: '🐘',
        entity: { singular: 'Elephant', plural: 'Elephants' },
        action: { verb: 'Sponsor', noun: 'sponsorship' }
      }
    },
    impactJourney: {
      enabled: true,
      messaging: {
        emoji: '🌱',
        onceHeadline: 'Your Support Today',
        monthlyHeadline: "Every Day You're There",
        yearlyHeadline: "Every Day You're There"
      },
      impactPerAmount: {
        items: [
          { amount: 5, label: 'Fresh fruit weekly' },
          { amount: 10, label: 'Medical checkup' },
          { amount: 15, label: 'Enrichment items' },
          { amount: 25, label: 'Complete care' },
          { amount: 50, label: 'Multiple elephants' },
          { amount: 75, label: 'Sanctuary upkeep' }
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
        heading: 'Send 100% to the Elephants',
        description:
          'By covering operational costs, your entire donation provides care and comfort for our elderly elephants.',
        defaultPercentage: 10
      }
    },
    giftAid: {
      enabled: false
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
      enabled: true,
      fields: [
        {
          id: 'organization',
          type: 'text',
          label: 'Organization Name',
          fieldConfig: {
            optional: true,
            placeholder: 'Your organization or company',
            defaultValue: 'Pangolin Conservation Society',
            maxLength: 150
          }
        },
        {
          id: 'pangolin_interest',
          type: 'textarea',
          label: 'Why are you passionate about pangolins?',
          fieldConfig: {
            optional: false,
            placeholder: 'Share your story...',
            rows: 3,
            maxLength: 300
          }
        },
        {
          id: 'commitment_level',
          type: 'slider',
          label: 'Monthly commitment level',
          fieldConfig: {
            optional: false,
            min: 1,
            max: 10,
            step: 1,
            defaultValue: 5,
            prefix: 'Level '
          }
        },
        {
          id: 'contact_preference',
          type: 'select',
          label: 'Preferred contact method',
          fieldConfig: {
            optional: false,
            placeholder: 'Choose your preference',
            defaultValue: 'Email',
            options: ['Email', 'Phone', 'Postal Mail', 'Do not contact me']
          }
        },
        {
          id: 'campaign_code',
          type: 'hidden',
          label: 'Campaign Code',
          fieldConfig: {
            defaultValue: 'PANGOLIN2025'
          }
        }
      ]
    }
  }
}
