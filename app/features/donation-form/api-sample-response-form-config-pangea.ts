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
      frequencies: {
        once: {
          enabled: true,
          messages: [
            {
              threshold: 25,
              title: 'Double your impact with monthly giving',
              description:
                '€25 once helps today. €5/month = €60/year of sustained care for our elderly elephants.',
              cta: {
                text: 'Switch to Monthly →',
                action: 'switch-monthly'
              }
            },
            {
              threshold: 50,
              title: 'Make it monthly for lasting impact',
              description:
                '€50 is generous! €10/month = €120/year provides ongoing support and sanctuary care.',
              cta: {
                text: 'Become a Monthly Supporter →',
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
              title: '🐘 Thank you for supporting our elephants monthly',
              description:
                "Your €5/month provides €60/year of ongoing sanctuary care. You'll receive updates on our elephant family."
            },
            {
              threshold: 10,
              title: '🐘 Join 800+ Monthly Elephant Guardians',
              description:
                'Your €10/month = €120/year helps provide food, medical care, and a safe home for our elderly elephants.'
            },
            {
              threshold: 25,
              title: '⭐ Champion Elephant Guardian',
              description:
                'Your €25/month = €300/year provides comprehensive care for one elephant. You make a profound difference!'
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
              title: '🐘 Your elephant sanctuary impact',
              description:
                'Your recurring donations provide stable support for our elephant sanctuary. Every month counts!'
            },
            {
              threshold: 20,
              title: '⭐ Major sanctuary supporter',
              description:
                'Your combined recurring support helps us plan long-term care for our elephant family. Thank you!'
            }
          ]
        }
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
