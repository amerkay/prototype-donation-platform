export const formConfig = {
  version: '1.0',
  form: {
    title: 'Make a Donation',
    subtitle: 'Choose your donation amount'
  },
  localization: {
    defaultCurrency: 'GBP',
    supportedCurrencies: [
      { code: 'USD', label: 'USD ($)', symbol: '$' },
      { code: 'EUR', label: 'EUR (€)', symbol: '€' },
      { code: 'GBP', label: 'GBP (£)', symbol: '£' }
    ] as const
  },
  pricing: {
    baseCurrency: 'GBP',
    frequencies: [
      {
        value: 'once',
        label: 'One-time',
        presetAmounts: [10, 25, 50, 100, 250, 500],
        customAmount: { min: 5, max: 1000 }
      },
      {
        value: 'monthly',
        label: 'Monthly',
        presetAmounts: [5, 10, 25, 50, 75, 100],
        customAmount: { min: 3, max: 500 }
      }
      // {
      //   value: 'yearly',
      //   label: 'Yearly',
      //   presetAmounts: [50, 100, 250, 500, 1000],
      //   customAmount: { min: 25, max: 2000 }
      // }
    ] as const
  },
  features: {
    multipleProducts: {
      enabled: true,
      initialDisplay: 3
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
    shippingNotice: {
      showNotice: true,
      noticeText: '📦 Shipping address on next page'
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
        gift: { enabled: true, label: '🎁 Gift to someone' },
        memorial: { enabled: true, label: '🕊️ In memory of someone' }
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
      ] as const,
      modal: {
        title: 'Gift or In Memory',
        subtitle: 'Make this donation in honor or memory of someone special'
      }
    }
  }
} as const
