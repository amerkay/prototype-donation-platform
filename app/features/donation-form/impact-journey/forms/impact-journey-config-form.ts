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
          'Define what each monthly amount provides. Write natural descriptions (e.g., "Fresh fruit for a week"). The system adapts messaging for one-time, monthly, and yearly donations automatically.',
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
                  // description: 'Amount in base currency',
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
                  // description: 'Short impact statement for monthly baseline',
                  placeholder: 'Fresh fruit and vegetables for a week',
                  rules: z.string().min(1, 'Required')
                }
              }
            },
            addButtonText: 'Add Impact Level'
          }
        }
      },
      upsellEnabled: {
        type: 'toggle',
        label: 'Enable Upsell Prompts',
        description: 'Show CTAs to encourage recurring donations or higher amounts',
        visibleWhen: (values) => values.enabled === true
      },
      upsellOnceToRecurring: {
        type: 'field-group',
        label: 'One-Time to Recurring Upsell',
        collapsible: true,
        collapsibleDefaultOpen: false,
        visibleWhen: (values) => values.enabled === true && values.upsellEnabled === true,
        fields: {
          enabled: {
            type: 'toggle',
            label: 'Enable',
            description:
              'Show CTA on one-time donations to switch to recurring giving (monthly or yearly)'
          },
          message: {
            type: 'textarea',
            label: 'Message',
            placeholder:
              'Your one-time gift helps today. Switch to recurring giving to provide ongoing care year-round.',
            rows: 2,
            visibleWhen: (values) => (values as Record<string, unknown>).enabled === true,
            rules: z.string().min(1, 'Required when enabled')
          },
          targetAmount: {
            type: 'combobox',
            label: 'Suggested Recurring Amount',
            description:
              'Select a preset amount from your recurring frequency options. Works for monthly or yearly donations.',
            placeholder: 'Select an amount...',
            optional: true,
            visibleWhen: (values) => (values as Record<string, unknown>).enabled === true,
            options: (values) => {
              // Get recurring frequency preset amounts from pricing config
              const pricing = (values as Record<string, unknown>).pricing as
                | Record<string, unknown>
                | undefined
              if (!pricing?.frequencies) return []

              const frequencies = pricing.frequencies as Record<string, unknown>
              const baseCurrency =
                ((pricing.baseCurrency as string) || 'GBP') === 'USD'
                  ? '$'
                  : ((pricing.baseCurrency as string) || 'GBP') === 'EUR'
                    ? '€'
                    : '£'

              const options: Array<{ value: number; label: string }> = []

              // Add monthly presets
              const monthly = frequencies.monthly as Record<string, unknown> | undefined
              if (monthly?.enabled && Array.isArray(monthly.presetAmounts)) {
                monthly.presetAmounts.forEach((amt: number) => {
                  options.push({
                    value: amt,
                    label: `Monthly: ${baseCurrency}${amt}`
                  })
                })
              }

              // Add yearly presets
              const yearly = frequencies.yearly as Record<string, unknown> | undefined
              if (yearly?.enabled && Array.isArray(yearly.presetAmounts)) {
                yearly.presetAmounts.forEach((amt: number) => {
                  options.push({
                    value: amt,
                    label: `Yearly: ${baseCurrency}${amt}`
                  })
                })
              }

              return options.sort((a, b) => a.value - b.value)
            }
          }
        }
      },
      upsellIncreaseAmount: {
        type: 'field-group',
        label: 'Amount Increase Prompt',
        collapsible: true,
        collapsibleDefaultOpen: false,
        visibleWhen: (values) => values.enabled === true && values.upsellEnabled === true,
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
