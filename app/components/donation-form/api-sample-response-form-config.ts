export const formConfig = {
  formTitle: 'Make a Donation',
  formSubtitle: 'Choose your donation amount',

  currencies: [
    { value: 'USD', label: 'USD ($)' },
    { value: 'EUR', label: 'EUR (€)' },
    { value: 'GBP', label: 'GBP (£)' }
  ] as const,

  defaultCurrency: 'GBP',

  frequencies: [
    { value: 'once', label: 'One-time' },
    { value: 'monthly', label: 'Monthly' }
    // { value: 'yearly', label: 'Yearly' }
  ] as const,

  // Amounts in base currency (GBP) - will be converted to selected currency
  amountsInBaseCurrency: {
    once: {
      amounts: [10, 25, 50, 100, 250, 500],
      minPrice: 5,
      maxPrice: 1000
    },
    monthly: {
      amounts: [5, 10, 25, 50, 75, 100],
      minPrice: 3,
      maxPrice: 500
    },
    yearly: {
      amounts: [50, 100, 250, 500, 1000],
      minPrice: 25,
      maxPrice: 2000
    }
  } as const,

  // Feature flags
  allowMultipleItems: true,
  initialProductsDisplayed: 3,

  adoptionFeature: {
    enabled: true,
    icon: '🦧',
    singularName: 'Orangutan',
    pluralName: 'Orangutans',
    actionVerb: 'Adopt',
    actionNoun: 'adoption',
    buttonText: '🦧 Adopt an Orangutan',
    buttonTextOnce: '🦧 Adopt an Orangutan (Monthly)',
    modalTitle: '🦧 Adopt an Orangutan',
    modalDescription: 'Choose an orangutan to support with a {frequency} donation',
    noProductsMessage: 'No {frequency} adoption products available'
  },

  bonusItemsSection: {
    freeGiftsLabel: '🎁 Free gifts available:',
    freeWithDonationLabel: 'FREE with your donation!',
    oneTimeLabel: 'one-time',
    monthlyLabel: 'monthly',
    yearlyLabel: 'yearly',
    addToUnlockSingleTemplate: 'Add {amount} {frequency} to unlock!',
    addToUnlockPairTemplate: 'Add {a} or {b} to unlock!',
    addToUnlockListTemplate: 'Add {list}, or {last} to unlock!',
    switchToTemplate: 'Switch to {frequency}'
  },

  shippingNotice: {
    message: '📦 Shipping address on next page'
  },

  multipleItemsSection: {
    title: 'Add Items to Your Donation',
    searchPlaceholder: 'Search items...',
    showMoreButton: 'Show {count} More Items',
    emptyStateMessage: 'No items found matching "{query}"'
  }
}
