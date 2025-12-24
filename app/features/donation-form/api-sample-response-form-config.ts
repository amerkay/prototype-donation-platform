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
        presetAmounts: [1, 25, 50, 100, 250, 500],
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
        icon: '🦧',
        entity: { singular: 'Orangutan', plural: 'Orangutans' },
        action: { verb: 'Adopt', noun: 'adoption' }
      }
    },
    rewards: {
      enabled: true,
      ui: {
        labels: {
          freeGifts: '🎁 Free gifts available:',
          freeWithDonation: 'FREE with your donation!'
        }
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
    }
  }
}
