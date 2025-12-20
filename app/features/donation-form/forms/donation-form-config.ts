import * as z from 'zod'
import type { ConfigSectionDef } from '~/features/form-builder/form-builder-types'
import { CURRENCY_OPTIONS } from '../composables/useCurrency'

/**
 * Create form config section definition
 * Returns the form configuration for editing form, localization, and pricing settings
 */
export function createFormConfigSection(): ConfigSectionDef {
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
                  label: {
                    type: 'text',
                    label: 'Display Label',
                    placeholder: 'One-time',
                    rules: z.string().min(1, 'Label is required')
                  },
                  presetAmounts: {
                    type: 'array',
                    label: 'Preset Amounts',
                    description: 'Preset donation amounts (in base currency)',
                    itemField: {
                      type: 'number',
                      label: 'Amount',
                      placeholder: '25',
                      min: 1,
                      rules: z.number().min(1, 'Must be at least 1')
                    },
                    addButtonText: 'Add Amount',
                    rules: z.array(z.number().min(1)).min(1, 'At least one preset required')
                  },
                  customAmount: {
                    type: 'field-group',
                    label: 'Custom Amount Range',
                    class: 'grid grid-cols-2 gap-x-3',
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
                  label: {
                    type: 'text',
                    label: 'Display Label',
                    placeholder: 'Monthly',
                    rules: z.string().min(1, 'Label is required')
                  },
                  presetAmounts: {
                    type: 'array',
                    label: 'Preset Amounts',
                    description: 'Preset donation amounts (in base currency)',
                    itemField: {
                      type: 'number',
                      label: 'Amount',
                      placeholder: '25',
                      min: 1,
                      rules: z.number().min(1, 'Must be at least 1')
                    },
                    addButtonText: 'Add Amount',
                    rules: z.array(z.number().min(1)).min(1, 'At least one preset required')
                  },
                  customAmount: {
                    type: 'field-group',
                    label: 'Custom Amount Range',
                    class: 'grid grid-cols-2 gap-x-3',
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
                  label: {
                    type: 'text',
                    label: 'Display Label',
                    placeholder: 'Yearly',
                    rules: z.string().min(1, 'Label is required')
                  },
                  presetAmounts: {
                    type: 'array',
                    label: 'Preset Amounts',
                    description: 'Preset donation amounts (in base currency)',
                    itemField: {
                      type: 'number',
                      label: 'Amount',
                      placeholder: '25',
                      min: 1,
                      rules: z.number().min(1, 'Must be at least 1')
                    },
                    addButtonText: 'Add Amount',
                    rules: z.array(z.number().min(1)).min(1, 'At least one preset required')
                  },
                  customAmount: {
                    type: 'field-group',
                    label: 'Custom Amount Range',
                    class: 'grid grid-cols-2 gap-x-3',
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
              }
            ],
            rules: z.object({
              once: z
                .object({
                  label: z.string().min(1),
                  presetAmounts: z.array(z.number()).min(1),
                  customAmount: z.object({
                    min: z.number().min(1),
                    max: z.number().min(1)
                  })
                })
                .optional(),
              monthly: z
                .object({
                  label: z.string().min(1),
                  presetAmounts: z.array(z.number()).min(1),
                  customAmount: z.object({
                    min: z.number().min(1),
                    max: z.number().min(1)
                  })
                })
                .optional(),
              yearly: z
                .object({
                  label: z.string().min(1),
                  presetAmounts: z.array(z.number()).min(1),
                  customAmount: z.object({
                    min: z.number().min(1),
                    max: z.number().min(1)
                  })
                })
                .optional()
            })
          }
        }
      }
    }
  }
}
