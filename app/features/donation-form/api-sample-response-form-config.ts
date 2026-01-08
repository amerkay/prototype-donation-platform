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
      customFieldsTabs: {
        step2: {
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
              id: 'textarea_recurring_reason',
              type: 'textarea' as const,
              label: 'Why choose a recurring donation?',
              advancedSettings: {
                optional: true,
                placeholder: 'Tell us your motivation...',
                rows: 2
              },
              enableVisibilityConditions: true,
              visibilityConditions: {
                visibleWhen: {
                  conditions: [
                    {
                      field: 'donationFrequency',
                      operator: 'in',
                      value: ['monthly', 'yearly']
                    }
                  ],
                  match: 'all'
                }
              }
            }
          ]
        },
        step3: {
          enabled: true,
          fields: [
            {
              id: 'text_premium_reporting',
              type: 'text' as const,
              label: 'Premium Reporting Contact',
              advancedSettings: {
                optional: true,
                placeholder: 'Email for detailed reports',
                maxLength: 100
              },
              enableVisibilityConditions: true,
              visibilityConditions: {
                visibleWhen: {
                  conditions: [
                    {
                      field: 'donationAmount',
                      operator: 'greaterOrEqual',
                      value: 100
                    }
                  ],
                  match: 'all'
                }
              }
            },
            {
              id: 'text_tribute_recipient_name',
              type: 'text' as const,
              label: "Tribute Recipient's Name",
              advancedSettings: {
                optional: true,
                placeholder: 'Full name',
                maxLength: 100
              },
              enableVisibilityConditions: true,
              visibilityConditions: {
                visibleWhen: {
                  conditions: [
                    {
                      field: 'isTribute',
                      operator: 'isTrue'
                    }
                  ],
                  match: 'all'
                }
              }
            },
            {
              id: 'text_cost_coverage_notes',
              type: 'text' as const,
              label: 'Cost Coverage Preference',
              advancedSettings: {
                optional: true,
                placeholder: 'Your coverage preference notes',
                maxLength: 200
              },
              enableVisibilityConditions: true,
              visibilityConditions: {
                visibleWhen: {
                  conditions: [
                    {
                      field: 'costCoveragePercentage',
                      operator: 'greaterThan',
                      value: 5
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
  }
}
