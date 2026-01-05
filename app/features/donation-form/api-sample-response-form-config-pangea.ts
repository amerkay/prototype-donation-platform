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
          id: 'text_company_name',
          type: 'text' as const,
          label: 'Company Name',
          advancedSettings: {
            optional: true,
            placeholder: 'Enter your company name',
            maxLength: 100
          }
        },
        {
          id: 'text_premium_code',
          type: 'text' as const,
          label: 'Premium Access Code',
          advancedSettings: {
            optional: true,
            placeholder: 'Enter your premium code'
          },
          // Only visible for premium tier users
          enableVisibilityConditions: true,
          visibilityConditions: {
            visibleWhen: {
              conditions: [
                {
                  field: 'subscriptionTier',
                  operator: 'equals',
                  value: 'premium'
                }
              ],
              match: 'all'
            }
          }
        },
        {
          id: 'textarea_special_message',
          type: 'textarea' as const,
          label: 'Special Message',
          advancedSettings: {
            optional: true,
            placeholder: 'Tell us something special...',
            rows: 3
          },
          // Only visible for enterprise tier users
          enableVisibilityConditions: true,
          visibilityConditions: {
            visibleWhen: {
              conditions: [
                {
                  field: 'subscriptionTier',
                  operator: 'equals',
                  value: 'enterprise'
                }
              ],
              match: 'all'
            }
          }
        }
      ]
    }
  }
}
