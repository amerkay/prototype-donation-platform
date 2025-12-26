import * as z from 'zod'
import type { FormDef } from '~/features/form-builder/types'
import { useFormConfigStore } from '~/stores/formConfig'

/**
 * Create impact journey config section definition
 * Ultra-simplified: just amount + label pairs
 */
export function createImpactJourneyConfigSection(): FormDef {
  const store = useFormConfigStore()

  return {
    id: 'impactJourney',
    fields: {
      enabled: {
        type: 'toggle',
        label: 'Enable Impact Journey',
        description: 'Auto-generates emotional impact messages based on donation amount',
        labelClass: 'font-bold'
      },
      impactPerAmount: {
        type: 'field-group',
        label: 'Impact Per Amount',
        description:
          'Define what each amount provides (max 20 chars). System auto-adapts for one-time/monthly/yearly.',
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
                  description: 'Keep it short (max 20 chars) for compact inline display',
                  placeholder: 'Fresh fruit weekly',
                  maxLength: 20,
                  rules: z.string().min(1, 'Required').max(20, 'Max 20 characters')
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
        description: 'Auto-generates "12x Impact" CTA to convert one-time donors',
        collapsible: true,
        collapsibleDefaultOpen: false,
        visibleWhen: (values) => values.enabled === true && values.upsellEnabled === true,
        fields: {
          enabled: {
            type: 'toggle',
            label: 'Enable',
            description: 'Shows CTA on one-time tab. Adapts for monthly/yearly based on target.'
          },
          targetAmount: {
            type: 'select',
            label: 'Suggested Amount',
            description: 'Auto-switches to correct tab (monthly/yearly) based on this amount.',
            placeholder: 'Select an amount...',
            optional: true,
            visibleWhen: (values) => (values as Record<string, unknown>).enabled === true,
            options: () => {
              // Get pricing config from store
              const pricing = store.formSettings?.pricing
              if (!pricing?.frequencies) return []

              const baseCurrency =
                pricing.baseCurrency === 'USD' ? '$' : pricing.baseCurrency === 'EUR' ? '€' : '£'

              const options: Array<{ value: number; label: string }> = []

              // Add monthly presets
              if (
                pricing.frequencies.monthly?.enabled &&
                pricing.frequencies.monthly.presetAmounts
              ) {
                pricing.frequencies.monthly.presetAmounts.forEach((amt) => {
                  options.push({
                    value: amt,
                    label: `Monthly: ${baseCurrency}${amt}`
                  })
                })
              }

              // Add yearly presets
              if (pricing.frequencies.yearly?.enabled && pricing.frequencies.yearly.presetAmounts) {
                pricing.frequencies.yearly.presetAmounts.forEach((amt) => {
                  options.push({
                    value: amt,
                    label: `Yearly: ${baseCurrency}${amt}`
                  })
                })
              }

              return options
            }
          }
        }
      },
      upsellIncreaseAmount: {
        type: 'field-group',
        label: 'Amount Increase Prompt',
        description: 'Auto-generates "Greater Impact" CTA with next preset amount',
        collapsible: true,
        collapsibleDefaultOpen: false,
        visibleWhen: (values) => values.enabled === true && values.upsellEnabled === true,
        fields: {
          enabled: {
            type: 'toggle',
            label: 'Enable',
            description:
              'Shows CTA with next higher preset (e.g., "Increase to £50 — Greater Impact").'
          }
        }
      }
    }
  }
}
