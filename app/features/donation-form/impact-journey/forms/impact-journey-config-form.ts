import * as z from 'zod'
import type { FormDef, FieldMetaMap } from '~/features/form-builder/types'
import { useCurrency } from '~/features/donation-form/composables/useCurrency'
import { useFormConfigStore } from '~/stores/formConfig'

const { getCurrencySymbol } = useCurrency('GBP')

/**
 * Create impact journey config section definition
 * Returns the form configuration for editing impact journey feature settings
 */
export function createImpactJourneyConfigSection(): FormDef {
  // Helper to create message fields for array items
  const createMessageFields = (
    frequencyLabel: string,
    currentFrequency: 'once' | 'monthly' | 'yearly' | 'multiple'
  ): FieldMetaMap => {
    const fields: FieldMetaMap = {
      threshold: {
        type: 'combobox' as const,
        label: 'Threshold Amount',
        description: `Message shows when ${frequencyLabel} donation >= this amount (in base currency)`,
        options: () => {
          const formConfigStore = useFormConfigStore()
          const pricing = formConfigStore.formSettings?.pricing
          if (!pricing) return []

          const baseCurrency = pricing.baseCurrency
          const symbol = getCurrencySymbol(baseCurrency)

          // Get all preset amounts from all enabled frequencies
          const allAmounts = new Set<number>()
          Object.values(pricing.frequencies).forEach((freq) => {
            if (
              (freq as { enabled: boolean; presetAmounts?: number[] }).enabled &&
              (freq as { enabled: boolean; presetAmounts?: number[] }).presetAmounts
            ) {
              ;(freq as { enabled: boolean; presetAmounts: number[] }).presetAmounts.forEach(
                (amt: number) => allAmounts.add(amt)
              )
            }
          })

          const sortedAmounts = Array.from(allAmounts).sort((a, b) => a - b)

          const options: Array<{ value: number; label: string }> = []

          // Add "< lowest" option
          if (sortedAmounts.length > 0) {
            options.push({ value: 0, label: `< ${symbol}${sortedAmounts[0]}` })
          }

          // Add each amount
          sortedAmounts.forEach((amt) => {
            options.push({ value: amt, label: `${symbol}${amt}` })
          })

          // Add "highest+" option
          if (sortedAmounts.length > 0) {
            const highest = sortedAmounts[sortedAmounts.length - 1]!
            options.push({ value: highest + 1, label: `${symbol}${highest}+` })
          }

          return options
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
        placeholder: 'Help provide daily care and ongoing support.',
        rows: 3,
        rules: z.string().min(1, 'Required')
      },
      showCta: {
        type: 'toggle' as const,
        label: 'Show Call-to-Action Button',
        description:
          currentFrequency === 'once'
            ? 'Enable a button to encourage switching to recurring donations'
            : 'Enable a button (note: button will not change frequency on this tab)',
        optional: true
      }
    }

    // Add CTA fields individually (not in a group) when currentFrequency allows it
    if (currentFrequency !== 'multiple') {
      fields.ctaText = {
        type: 'text' as const,
        label: 'Button Text',
        placeholder: 'Switch to Monthly →',
        visibleWhen: (values) => (values as Record<string, unknown>).showCta === true,
        rules: z.string().min(1, 'Required when CTA enabled')
      }

      if (currentFrequency === 'once') {
        fields.ctaAction = {
          type: 'combobox' as const,
          label: 'Target Frequency',
          description: 'Which tab to switch to',
          visibleWhen: (values) => (values as Record<string, unknown>).showCta === true,
          options: () => {
            const formConfigStore = useFormConfigStore()
            const pricing = formConfigStore.formSettings?.pricing
            if (!pricing) return []

            const options: Array<{
              value: string
              label: string
              disabled?: boolean
            }> = []

            const monthly = pricing.frequencies.monthly
            const yearly = pricing.frequencies.yearly

            if (monthly) {
              options.push({
                value: 'switch-monthly',
                label: monthly.enabled ? `Switch to ${monthly.label}` : `Monthly (Disabled)`,
                disabled: !monthly.enabled
              })
            }
            if (yearly) {
              options.push({
                value: 'switch-yearly',
                label: yearly.enabled ? `Switch to ${yearly.label}` : `Yearly (Disabled)`,
                disabled: !yearly.enabled
              })
            }

            return options
          },
          rules: z.enum(['switch-monthly', 'switch-yearly'])
        }

        fields.ctaTargetAmount = {
          type: 'combobox' as const,
          label: 'Target Amount',
          description: 'Preset amount to set when switching (optional)',
          optional: true,
          visibleWhen: (values) => (values as Record<string, unknown>).showCta === true,
          options: (values: Record<string, unknown>) => {
            const formConfigStore = useFormConfigStore()
            const ctaAction = (values as Record<string, unknown>).ctaAction as string | undefined
            const pricing = formConfigStore.formSettings?.pricing
            if (!pricing) return []

            const targetFreq = ctaAction === 'switch-yearly' ? 'yearly' : 'monthly'
            const freqConfig = pricing.frequencies[targetFreq as 'monthly' | 'yearly']

            if (!freqConfig?.presetAmounts) return []

            const baseCurrency = pricing.baseCurrency
            const symbol = getCurrencySymbol(baseCurrency)

            return freqConfig.presetAmounts.map((amt: number) => ({
              value: amt,
              label: `${symbol}${amt}`
            }))
          }
        }
      }
    }

    return fields
  }

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
                  fields: createMessageFields('one-time', 'once')
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
                  fields: createMessageFields('monthly', 'monthly')
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
                  fields: createMessageFields('yearly', 'yearly')
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
                  fields: createMessageFields('recurring', 'multiple')
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
