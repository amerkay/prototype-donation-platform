export const formConfig = {
  version: '1.0',
  campaignId: 'adopt-orangutan',
  form: {
    title: 'Make a Donation',
    subtitle: 'Choose your donation amount',
    formType: 'donation' as const
  },
  donationAmounts: {
    baseDefaultCurrency: 'GBP',
    frequencies: {
      once: {
        enabled: true,
        label: 'One-time',
        enableAmountDescriptions: false,
        presetAmounts: [
          { amount: 5 },
          { amount: 10 },
          { amount: 25 },
          { amount: 50 },
          { amount: 75 },
          { amount: 100 }
        ],
        customAmount: { min: 5, max: 1000 }
      },
      monthly: {
        enabled: true,
        label: 'Monthly',
        enableAmountDescriptions: true,
        presetAmounts: [
          {
            amount: 10,
            shortText: 'Fresh fruit weekly',
            image: '/imgs/orangutan-felix-square.jpg'
          },
          { amount: 25, shortText: 'Medical checkup', image: '/imgs/orangutan-felix-square.jpg' },
          { amount: 50, shortText: 'Enrichment toys', image: '/imgs/orangutan-felix-square.jpg' },
          {
            amount: 100,
            shortText: 'Complete care package',
            image: '/imgs/orangutan-felix-square.jpg'
          },
          {
            amount: 250,
            shortText: 'Multiple orangutans',
            image: '/imgs/orangutan-felix-square.jpg'
          },
          { amount: 500, shortText: 'Rescue equipment', image: '/imgs/orangutan-felix-square.jpg' }
        ],
        customAmount: { min: 3, max: 500 }
      },
      yearly: {
        enabled: false,
        label: 'Yearly',
        presetAmounts: [
          { amount: 50 },
          { amount: 100 },
          { amount: 250 },
          { amount: 500 },
          { amount: 1000 },
          { amount: 1500 }
        ],
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
    impactBoost: {
      enabled: true,
      messages: {
        recurringBoostMessage: 'Your monthly gift means they can count on you every single day ❤️',
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
    entryFields: { enabled: false, mode: 'shared' as const, fields: [] },
    customFields: {
      customFieldsTabs: {
        //   step2: {
        //     enabled: true,
        //     fields: [
        //       {
        //         id: 'text_company_name',
        //         type: 'text' as const,
        //         label: 'Company Name',
        //         advancedSettings: {
        //           optional: true,
        //           placeholder: 'Enter your company name',
        //           maxLength: 100
        //         }
        //       },
        //       {
        //         id: 'textarea_recurring_reason',
        //         type: 'textarea' as const,
        //         label: 'Why choose a recurring donation?',
        //         advancedSettings: {
        //           optional: true,
        //           placeholder: 'Tell us your motivation...',
        //           rows: 2
        //         },
        //         enableVisibilityConditions: true,
        //         visibilityConditions: {
        //           visibleWhen: {
        //             conditions: [
        //               {
        //                 field: 'donationFrequency',
        //                 operator: 'in' as const,
        //                 value: ['monthly', 'yearly']
        //               }
        //             ],
        //             match: 'all' as const
        //           }
        //         }
        //       }
        //     ]
        //   },
        //   step3: {
        //     enabled: true,
        //     fields: [
        //       {
        //         id: 'text_premium_reporting',
        //         type: 'text' as const,
        //         label: 'Premium Reporting Contact',
        //         advancedSettings: {
        //           optional: true,
        //           placeholder: 'Email for detailed reports',
        //           maxLength: 100
        //         },
        //         enableVisibilityConditions: true,
        //         visibilityConditions: {
        //           visibleWhen: {
        //             conditions: [
        //               {
        //                 field: 'donationAmount',
        //                 operator: 'greaterOrEqual' as const,
        //                 value: 100
        //               }
        //             ],
        //             match: 'all' as const
        //           }
        //         }
        //       },
        //       {
        //         id: 'text_tribute_recipient_name',
        //         type: 'text' as const,
        //         label: "Tribute Recipient's Name",
        //         advancedSettings: {
        //           optional: true,
        //           placeholder: 'Full name',
        //           maxLength: 100
        //         },
        //         enableVisibilityConditions: true,
        //         visibilityConditions: {
        //           visibleWhen: {
        //             conditions: [
        //               {
        //                 field: 'isTribute',
        //                 operator: 'isTrue' as const
        //               }
        //             ],
        //             match: 'all' as const
        //           }
        //         }
        //       },
        //       {
        //         id: 'text_cost_coverage_notes',
        //         type: 'text' as const,
        //         label: 'Cost Coverage Preference',
        //         advancedSettings: {
        //           optional: true,
        //           placeholder: 'Your coverage preference notes',
        //           maxLength: 200
        //         },
        //         enableVisibilityConditions: true,
        //         visibilityConditions: {
        //           visibleWhen: {
        //             conditions: [
        //               {
        //                 field: 'costCoveragePercentage',
        //                 operator: 'greaterOrEqual' as const,
        //                 value: 5
        //               }
        //             ],
        //             match: 'all' as const
        //           }
        //         }
        //       }
        //     ]
        //   },
        //   hidden: {
        //     enabled: true,
        //     fields: [
        //       {
        //         id: 'hidden_is_large_donor',
        //         type: 'hidden' as const,
        //         label: 'is_large_donor',
        //         defaultValue: 'yes',
        //         enableVisibilityConditions: true,
        //         visibilityConditions: {
        //           visibleWhen: {
        //             conditions: [
        //               {
        //                 field: 'donationAmount',
        //                 operator: 'greaterOrEqual' as const,
        //                 value: 50
        //               }
        //             ],
        //             match: 'all' as const
        //           }
        //         }
        //       }
        //     ]
        //   }
      }
    }
  }
}
