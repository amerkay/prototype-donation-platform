import * as z from 'zod'
import type { ConfigSectionDef } from '~/features/form-builder/form-builder-types'
import { CURRENCY_OPTIONS } from '../composables/useCurrency'

/**
 * Create form config section definition
 * Returns the form configuration for editing form, localization, and pricing settings
 */
export function createFormConfigSection(): ConfigSectionDef {
  const frequencySchema = z
    .object({
      enabled: z.boolean(),
      label: z.string(),
      presetAmounts: z.array(z.number()),
      customAmount: z.object({
        min: z.number().min(1),
        max: z.number().min(1)
      })
    })
    .superRefine((val, ctx) => {
      if (!val.enabled) return

      if (!val.label.trim()) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Label is required',
          path: ['label']
        })
      }

      if (!val.presetAmounts.length) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'At least one preset required',
          path: ['presetAmounts']
        })
      }

      val.presetAmounts.forEach((amount, idx) => {
        if (amount < 1) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: 'Must be at least 1',
            path: ['presetAmounts', idx]
          })
        }
      })
    })

  const enabledString = (values: Record<string, unknown>, message: string) =>
    values.enabled ? z.string().min(1, message) : z.string()

  const enabledPresetAmounts = (values: Record<string, unknown>) =>
    values.enabled
      ? z.array(z.number().min(1)).min(1, 'At least one preset required')
      : z.array(z.number())

  return {
    id: 'form',
    title: 'Form Settings',
    description: 'Configure form title, currencies, and pricing',
    fields: {
      form: {
        type: 'field-group',
        label: 'Basic Settings',
        collapsible: true,
        collapsibleDefaultOpen: false,

        fields: {
          title: {
            type: 'text',
            label: 'Form Title',
            placeholder: 'Enter form title',
            rules: z.string().min(1, 'Title is required')
          },
          subtitle: {
            type: 'text',
            label: 'Form Subtitle',
            placeholder: 'Enter form subtitle',
            optional: true
          }
        }
      },
      branding: {
        type: 'field-group',
        label: 'Branding',
        collapsible: true,
        collapsibleDefaultOpen: false,
        badgeLabel: 'On my TODO list',
        badgeVariant: 'secondary',
        isDisabled: true
      },
      localization: {
        type: 'field-group',
        label: 'Currency Settings',
        collapsible: true,
        collapsibleDefaultOpen: false,

        fields: {
          supportedCurrencies: {
            type: 'combobox',
            label: 'Supported Currencies',
            description: 'Currencies available for donors to choose from (select multiple)',
            placeholder: 'Select currencies',
            searchPlaceholder: 'Search currencies...',
            multiple: true,
            options: CURRENCY_OPTIONS,
            rules: z.array(z.string()).min(1, 'At least one currency must be supported'),
            onChange: (value, allValues, setValue) => {
              const defaultCurrency = allValues.defaultCurrency as string | undefined
              const supportedCurrencies = (value as string[]).filter(Boolean)

              if (supportedCurrencies.length > 0) {
                if (!defaultCurrency || !supportedCurrencies.includes(defaultCurrency)) {
                  setValue('localization.defaultCurrency', supportedCurrencies[0])
                }
              } else {
                setValue('localization.defaultCurrency', '')
              }
            }
          },
          defaultCurrency: {
            type: 'combobox',
            label: 'Default Currency',
            description:
              'The default currency shown when users first load the donation form (choose from supported currencies above)',
            placeholder: 'Select default currency',
            searchPlaceholder: 'Search currencies...',
            options: (values) => {
              // Only show currencies that are in the supported list
              const supportedCurrencies = (values.supportedCurrencies as string[]) || []
              return CURRENCY_OPTIONS.filter((opt) => supportedCurrencies.includes(opt.value))
            },
            rules: z.string().min(1, 'Default currency is required')
          }
        }
      },
      pricing: {
        type: 'field-group',
        label: 'Pricing Configuration',
        collapsible: true,
        collapsibleDefaultOpen: false,

        fields: {
          baseCurrency: {
            type: 'combobox',
            label: 'Base Currency',
            description: 'The currency used for internal calculations and product pricing',
            placeholder: 'Select base currency',
            searchPlaceholder: 'Search currencies...',
            options: CURRENCY_OPTIONS,
            rules: z.string().min(1, 'Base currency is required')
          },
          frequencies: {
            type: 'tabs',
            label: 'Donation Frequencies',
            description: 'Configure available donation frequencies and their preset amounts',
            defaultValue: 'once',
            tabs: [
              {
                value: 'once',
                label: 'One-time',
                fields: {
                  enabled: {
                    type: 'toggle',
                    label: 'Enabled',
                    description: 'Show One-time as an option on the donation form',
                    rules: z.boolean()
                  },
                  label: {
                    type: 'text',
                    label: 'Display Label',
                    placeholder: 'One-time',
                    visibleWhen: (values) => !!values.enabled,
                    rules: (values) => enabledString(values, 'Label is required')
                  },
                  presetAmounts: {
                    type: 'array',
                    label: 'Preset Amounts',
                    description: 'Preset donation amounts (in base currency)',
                    visibleWhen: (values) => !!values.enabled,
                    itemField: {
                      type: 'number',
                      label: 'Amount',
                      placeholder: '25',
                      min: 1,
                      rules: z.number().min(1, 'Must be at least 1')
                    },
                    addButtonText: 'Add Amount',
                    rules: (values) => enabledPresetAmounts(values)
                  },
                  customAmount: {
                    type: 'field-group',
                    label: 'Custom Amount Range',
                    class: 'grid grid-cols-2 gap-x-3',
                    visibleWhen: (values) => !!values.enabled,
                    fields: {
                      min: {
                        type: 'number',
                        label: 'Minimum',
                        placeholder: '1',
                        min: 1,
                        rules: z.number().min(1, 'Must be at least 1')
                      },
                      max: {
                        type: 'number',
                        label: 'Maximum',
                        placeholder: '1000000',
                        min: 1,
                        rules: z.number().min(1, 'Must be at least 1')
                      }
                    }
                  }
                }
              },
              {
                value: 'monthly',
                label: 'Monthly',
                fields: {
                  enabled: {
                    type: 'toggle',
                    label: 'Enabled',
                    description: 'Show Monthly as an option on the donation form',
                    rules: z.boolean()
                  },
                  label: {
                    type: 'text',
                    label: 'Display Label',
                    placeholder: 'Monthly',
                    visibleWhen: (values) => !!values.enabled,
                    rules: (values) => enabledString(values, 'Label is required')
                  },
                  presetAmounts: {
                    type: 'array',
                    label: 'Preset Amounts',
                    description: 'Preset donation amounts (in base currency)',
                    visibleWhen: (values) => !!values.enabled,
                    itemField: {
                      type: 'number',
                      label: 'Amount',
                      placeholder: '25',
                      min: 1,
                      rules: z.number().min(1, 'Must be at least 1')
                    },
                    addButtonText: 'Add Amount',
                    rules: (values) => enabledPresetAmounts(values)
                  },
                  customAmount: {
                    type: 'field-group',
                    label: 'Custom Amount Range',
                    class: 'grid grid-cols-2 gap-x-3',
                    visibleWhen: (values) => !!values.enabled,
                    fields: {
                      min: {
                        type: 'number',
                        label: 'Minimum',
                        placeholder: '1',
                        min: 1,
                        rules: z.number().min(1, 'Must be at least 1')
                      },
                      max: {
                        type: 'number',
                        label: 'Maximum',
                        placeholder: '1000000',
                        min: 1,
                        rules: z.number().min(1, 'Must be at least 1')
                      }
                    }
                  }
                }
              },
              {
                value: 'yearly',
                label: 'Yearly',
                fields: {
                  enabled: {
                    type: 'toggle',
                    label: 'Enabled',
                    description: 'Show Yearly as an option on the donation form',
                    rules: z.boolean()
                  },
                  label: {
                    type: 'text',
                    label: 'Display Label',
                    placeholder: 'Yearly',
                    visibleWhen: (values) => !!values.enabled,
                    rules: (values) => enabledString(values, 'Label is required')
                  },
                  presetAmounts: {
                    type: 'array',
                    label: 'Preset Amounts',
                    description: 'Preset donation amounts (in base currency)',
                    visibleWhen: (values) => !!values.enabled,
                    itemField: {
                      type: 'number',
                      label: 'Amount',
                      placeholder: '25',
                      min: 1,
                      rules: z.number().min(1, 'Must be at least 1')
                    },
                    addButtonText: 'Add Amount',
                    rules: (values) => enabledPresetAmounts(values)
                  },
                  customAmount: {
                    type: 'field-group',
                    label: 'Custom Amount Range',
                    class: 'grid grid-cols-2 gap-x-3',
                    visibleWhen: (values) => !!values.enabled,
                    fields: {
                      min: {
                        type: 'number',
                        label: 'Minimum',
                        placeholder: '1',
                        min: 1,
                        rules: z.number().min(1, 'Must be at least 1')
                      },
                      max: {
                        type: 'number',
                        label: 'Maximum',
                        placeholder: '50000',
                        min: 1,
                        rules: z.number().min(1, 'Must be at least 1')
                      }
                    }
                  }
                }
              }
            ],
            rules: z
              .object({
                once: frequencySchema,
                monthly: frequencySchema,
                yearly: frequencySchema
              })
              .refine((val) => val.once.enabled || val.monthly.enabled || val.yearly.enabled, {
                message: 'Enable at least one donation frequency'
              })
          }
        }
      }
    }
  }
}
