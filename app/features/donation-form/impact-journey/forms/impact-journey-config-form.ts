import * as z from 'zod'
import type { FormDef } from '~/features/form-builder/types'

/**
 * Create impact journey config section definition
 * Ultra-simplified: just amount + label pairs
 */
export function createImpactJourneyConfigSection(): FormDef {
  return {
    id: 'impactJourney',
    fields: {
      enabled: {
        type: 'toggle',
        label: 'Enable Impact Journey',
        description:
          'Auto-generates emotional impact messages showing what each donation amount provides',
        labelClass: 'font-bold'
      },
      impactPerAmount: {
        type: 'field-group',
        label: 'Impact Per Amount',
        description:
          'Define what each amount level provides. System automatically shows all items up to the donation amount.',
        collapsible: true,
        collapsibleDefaultOpen: false,
        visibleWhen: (values) => values.enabled === true,
        fields: {
          items: {
            type: 'array',
            label: '',
            itemField: {
              type: 'field-group',
              label: (values) => {
                const amt = ((values as Record<string, unknown>)?.amount as number) || 0
                const text = ((values as Record<string, unknown>)?.label as string) || ''
                if (!amt && !text) return 'New Impact Level'
                if (!amt) return text.length > 40 ? text.substring(0, 40) + '...' : text
                const truncated = text.length > 35 ? text.substring(0, 35) + '...' : text
                return truncated ? `£${amt} — ${truncated}` : `£${amt}`
              },
              collapsible: true,
              collapsibleDefaultOpen: false,
              class: 'grid grid-cols-1 sm:grid-cols-[140px_1fr] gap-4',
              fields: {
                amount: {
                  type: 'currency',
                  label: 'Amount',
                  description: 'Amount in base currency',
                  placeholder: '10',
                  currencySymbol: (values) => {
                    // Traverse up to get base currency from pricing config
                    const baseCurrency =
                      ((values as Record<string, unknown>)?.pricing as Record<string, unknown>)
                        ?.baseCurrency || 'GBP'
                    return baseCurrency === 'USD' ? '$' : baseCurrency === 'EUR' ? '€' : '£'
                  },
                  rules: z.number().min(0.01, 'Must be positive')
                },
                label: {
                  type: 'text',
                  label: 'What This Provides',
                  description: 'Short impact statement (e.g., "Daily fresh fruit and vegetables")',
                  placeholder: 'Complete care for one elephant',
                  rules: z.string().min(1, 'Required')
                }
              }
            },
            addButtonText: 'Add Impact Level'
          }
        }
      },
      upsell: {
        type: 'field-group',
        label: 'Optional Upsell Prompts',
        description: 'Encourage monthly giving or amount increases',
        collapsible: true,
        collapsibleDefaultOpen: false,
        visibleWhen: (values) => values.enabled === true,
        fields: {
          enabled: {
            type: 'toggle',
            label: 'Enable Upsell Prompts',
            description: 'Show CTAs to encourage recurring donations or higher amounts'
          },
          onceToMonthly: {
            type: 'field-group',
            label: 'One-Time to Monthly Upsell',
            collapsible: true,
            visibleWhen: (values) => (values as Record<string, unknown>).enabled === true,
            fields: {
              enabled: {
                type: 'toggle',
                label: 'Enable',
                description: 'Show CTA on one-time donations to switch to monthly'
              },
              message: {
                type: 'textarea',
                label: 'Message',
                placeholder:
                  'Your one-time gift helps today. Switch to monthly giving to provide ongoing care year-round.',
                rows: 2,
                visibleWhen: (values) => (values as Record<string, unknown>).enabled === true,
                rules: z.string().min(1, 'Required when enabled')
              },
              targetAmount: {
                type: 'number',
                label: 'Suggested Monthly Amount',
                description: 'Optional preset amount to suggest (leave blank for current amount)',
                optional: true,
                visibleWhen: (values) => (values as Record<string, unknown>).enabled === true
              }
            }
          },
          increaseAmount: {
            type: 'field-group',
            label: 'Amount Increase Prompt',
            collapsible: true,
            visibleWhen: (values) => (values as Record<string, unknown>).enabled === true,
            fields: {
              enabled: {
                type: 'toggle',
                label: 'Enable',
                description: 'Show CTA on monthly/yearly donations to increase amount'
              },
              message: {
                type: 'textarea',
                label: 'Message',
                placeholder: 'Want to help even more? Consider increasing your monthly support.',
                rows: 2,
                visibleWhen: (values) => (values as Record<string, unknown>).enabled === true,
                rules: z.string().min(1, 'Required when enabled')
              }
            }
          }
        }
      }
    }
  }
}
