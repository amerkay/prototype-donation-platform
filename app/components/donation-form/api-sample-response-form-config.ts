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
      initialDisplay: 3,
      ui: {
        title: 'Add Items to Your Donation',
        searchPlaceholder: 'Search items...',
        showMoreButtonTemplate: 'Show {count} More Items',
        emptyStateTemplate: 'No items found matching "{query}"'
      }
    },
    productSelector: {
      enabled: true,
      config: {
        icon: '🦧',
        entity: { singular: 'Orangutan', plural: 'Orangutans' },
        action: { verb: 'Adopt', noun: 'adoption' },
        ui: {
          buttonText: '🦧 Adopt an Orangutan',
          buttonTextOnce: '🦧 Adopt an Orangutan (Monthly)',
          modalTitle: '🦧 Adopt an Orangutan',
          modalDescriptionTemplate: 'Choose an orangutan to support with a {frequency} donation',
          noProductsTemplate: 'No {frequency} adoption products available'
        }
      }
    },
    rewards: {
      enabled: true,
      ui: {
        labels: {
          freeGifts: '🎁 Free gifts available:',
          freeWithDonation: 'FREE with your donation!',
          frequencies: { once: 'one-time', monthly: 'monthly', yearly: 'yearly' }
        },
        templates: {
          unlockSingle: 'Add {amount} {frequency} to unlock!',
          unlockPair: 'Add {a} or {b} to unlock!',
          unlockList: 'Add {list}, or {last} to unlock!',
          switchFrequency: 'Switch to {frequency}'
        }
      }
    },
    shippingNotice: {
      showNotice: true,
      noticeText: '📦 Shipping address on next page'
    }
  }
} as const
