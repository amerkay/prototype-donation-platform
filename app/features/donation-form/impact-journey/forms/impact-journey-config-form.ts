import * as z from 'zod'
import type { FormDef } from '~/features/form-builder/types'
import { useCurrency } from '~/features/donation-form/composables/useCurrency'

const { getCurrencySymbol } = useCurrency('GBP')

/**
 * Create impact journey config section definition
 * Returns the form configuration for editing impact journey feature settings
 */
export function createImpactJourneyConfigSection(): FormDef {
  // Helper to create message fields for array items
  const createMessageFields = (frequencyLabel: string) => ({
    threshold: {
      type: 'currency' as const,
      label: 'Threshold Amount',
      description: `Message shows when ${frequencyLabel} donation >= this amount (in base currency)`,
      placeholder: '50',
      currencySymbol: (values: Record<string, unknown>) => {
        const pricing = values.pricing as Record<string, unknown> | undefined
        const baseCurrency = (pricing?.baseCurrency as string) || 'GBP'
        return getCurrencySymbol(baseCurrency)
      },
      rules: z.number().min(0, 'Must be positive')
    },
    title: {
      type: 'text' as const,
      label: 'Message Title',
      description: 'Bold heading (e.g., "Make it monthly for greater impact")',
      placeholder: 'Your impact multiplied',
      rules: z.string().min(1, 'Required')
    },
    description: {
      type: 'textarea' as const,
      label: 'Message Description',
      description: 'Educational body text explaining impact',
      placeholder: '£50 once helps today. £10/month = £120/year of sustained support.',
      rows: 3,
      rules: z.string().min(1, 'Required')
    },
    cta: {
      type: 'field-group' as const,
      label: 'Call to Action (Optional)',
      description: 'Button to encourage switching tabs',
      collapsible: true,
      collapsibleDefaultOpen: false,
      fields: {
        text: {
          type: 'text' as const,
          label: 'Button Text',
          placeholder: 'Switch to Monthly →',
          optional: true
        },
        action: {
          type: 'select' as const,
          label: 'Action',
          optional: true,
          options: [
            { value: 'switch-monthly', label: 'Switch to Monthly' },
            { value: 'switch-yearly', label: 'Switch to Yearly' }
          ]
        }
      }
    }
  })

  return {
    id: 'impactJourney',
    fields: {
      enabled: {
        type: 'toggle',
        label: 'Enable Impact Journey',
        description: 'Show educational impact messages based on donation amount',
        labelClass: 'font-bold'
      },
      frequencies: {
        type: 'tabs',
        visibleWhen: (values) => values.enabled === true,
        tabs: [
          {
            value: 'once',
            label: 'One-time',
            fields: {
              enabled: {
                type: 'toggle',
                label: 'Show messages on this tab',
                description: 'Enable impact messaging for one-time donations'
              },
              messages: {
                type: 'array',
                label: 'Impact Messages',
                description: 'Messages shown when donation meets threshold',
                visibleWhen: (values) => values.enabled === true,
                itemField: {
                  type: 'field-group',
                  label: (values) =>
                    `£${(values as Record<string, unknown>)?.threshold ?? 0} threshold`,
                  collapsible: true,
                  collapsibleDefaultOpen: false,
                  fields: createMessageFields('one-time')
                },
                addButtonText: 'Add Message'
              }
            }
          },
          {
            value: 'monthly',
            label: 'Monthly',
            fields: {
              enabled: {
                type: 'toggle',
                label: 'Show messages on this tab',
                description: 'Enable impact messaging for monthly donations'
              },
              messages: {
                type: 'array',
                label: 'Impact Messages',
                description: 'Messages shown when monthly donation meets threshold',
                visibleWhen: (values) => values.enabled === true,
                itemField: {
                  type: 'field-group',
                  label: (values) =>
                    `£${(values as Record<string, unknown>)?.threshold ?? 0}/month threshold`,
                  collapsible: true,
                  collapsibleDefaultOpen: false,
                  fields: createMessageFields('monthly')
                },
                addButtonText: 'Add Message'
              }
            }
          },
          {
            value: 'yearly',
            label: 'Yearly',
            fields: {
              enabled: {
                type: 'toggle',
                label: 'Show messages on this tab',
                description: 'Enable impact messaging for yearly donations'
              },
              messages: {
                type: 'array',
                label: 'Impact Messages',
                description: 'Messages shown when yearly donation meets threshold',
                visibleWhen: (values) => values.enabled === true,
                itemField: {
                  type: 'field-group',
                  label: (values) =>
                    `£${(values as Record<string, unknown>)?.threshold ?? 0}/year threshold`,
                  collapsible: true,
                  collapsibleDefaultOpen: false,
                  fields: createMessageFields('yearly')
                },
                addButtonText: 'Add Message'
              }
            }
          },
          {
            value: 'multiple',
            label: 'Multiple Items',
            fields: {
              enabled: {
                type: 'toggle',
                label: 'Show messages on this tab',
                description: 'Enable impact messaging for cart view'
              },
              messages: {
                type: 'array',
                label: 'Impact Messages',
                description:
                  'Messages shown based on total recurring amount (monthly + yearly combined)',
                visibleWhen: (values) => values.enabled === true,
                itemField: {
                  type: 'field-group',
                  label: (values) =>
                    `£${(values as Record<string, unknown>)?.threshold ?? 0} recurring threshold`,
                  collapsible: true,
                  collapsibleDefaultOpen: false,
                  fields: createMessageFields('recurring')
                },
                addButtonText: 'Add Message'
              }
            }
          }
        ]
      }
    }
  }
}
