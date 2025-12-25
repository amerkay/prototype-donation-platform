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
    impactJourney: {
      enabled: true,
      frequencies: {
        once: {
          enabled: true,
          messages: [
            {
              threshold: 50,
              title: 'Make it monthly for greater impact',
              description: '£50 once helps today. £10/month = £120/year of sustained support.',
              cta: {
                text: 'Switch to Monthly →',
                action: 'switch-monthly'
              }
            },
            {
              threshold: 100,
              title: 'Join our major donors circle',
              description: '£100 once is generous. £25/month = £300/year creates lasting change.',
              cta: {
                text: 'Make it Monthly →',
                action: 'switch-monthly'
              }
            }
          ]
        },
        monthly: {
          enabled: true,
          messages: [
            {
              threshold: 5,
              title: '💙 Thank you for becoming a monthly supporter',
              description:
                "Your £5/month creates £60 sustained annual impact. You'll receive quarterly updates on our blog."
            },
            {
              threshold: 10,
              title: '💙 Join 1,200+ Monthly Supporters',
              description:
                "Your £10/month = £120/year of sustained support. You'll receive quarterly impact updates (available publicly on our blog)."
            },
            {
              threshold: 25,
              title: '🌟 Major monthly supporter',
              description:
                'Your £25/month = £300/year provides stable funding for multiple programs. Thank you!'
            }
          ]
        },
        yearly: {
          enabled: false,
          messages: []
        },
        multiple: {
          enabled: true,
          messages: [
            {
              threshold: 10,
              title: '💡 Your combined recurring impact',
              description:
                'Your cart includes recurring donations that create sustained annual support. Thank you!'
            },
            {
              threshold: 25,
              title: '🌟 Major supporter: Recurring gifts in cart',
              description:
                'Your recurring items provide stable, predictable funding for our programs. This makes a huge difference!'
            }
          ]
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
