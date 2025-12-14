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
        tabLabel: 'Multiple ✨',
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
      showNotice: false,
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
        gift: { label: '🎁 Gift to someone' },
        memorial: { label: '🕊️ In memory of someone' }
      },
      form: {
        tributeTypeSection: {
          legend: 'Tribute Type',
          description: 'Make this donation a tribute to someone special'
        },
        honoreeSection: {
          legendGift: 'Gift to',
          legendMemorial: 'In Memory of',
          legendDefault: 'Honoree',
          description: 'Provide details about the person being honored',
          fields: {
            firstName: {
              label: 'First Name',
              placeholder: 'First name'
            },
            lastName: {
              label: 'Last Name',
              placeholder: 'Last name',
              optional: '(optional)'
            },
            relationship: {
              label: 'Relationship',
              placeholder: 'Select relationship...',
              optional: '(optional)',
              searchPlaceholder: 'Search relationship...',
              notFound: 'No relationship found.'
            }
          }
        },
        eCardSection: {
          toggle: {
            title: '📧 Send an eCard notification',
            description: 'Notify the recipient via email about this tribute donation'
          },
          recipientSection: {
            legend: 'eCard Recipient',
            description: 'Who should receive the notification email?'
          },
          sameAsHonoree: {
            titleTemplate: 'Send to {honoree}',
            description: 'Send the eCard directly to the gift recipient'
          },
          fields: {
            firstName: {
              label: 'First Name',
              placeholder: 'First name'
            },
            lastName: {
              label: 'Last Name',
              placeholder: 'Last name',
              optional: '(optional)'
            },
            email: {
              label: 'Email Address',
              placeholder: 'name@example.com'
            }
          }
        }
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
      validation: {
        honoreeFirstName: {
          required: 'First name is required',
          minLength: 'First name must be at least 2 characters'
        },
        recipientFirstName: {
          required: 'First name is required',
          minLength: 'First name must be at least 2 characters'
        },
        recipientEmail: {
          required: 'Email is required',
          invalid: 'Enter a valid email address'
        }
      },
      modal: {
        title: 'Gift or In Memory',
        subtitle: 'Make this donation in honor or memory of someone special',
        saveButton: 'Save',
        cancelButton: 'Cancel'
      },
      card: {
        editButton: 'Edit',
        removeButton: '✕'
      },
      line: {
        relationshipTemplate: '({relationship})',
        eCardTemplate: '📧 eCard to {recipient}'
      }
    }
  }
} as const
