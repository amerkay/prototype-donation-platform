import * as z from 'zod'
import type { ConfigSectionDef } from '~/features/form-builder/form-builder-types'

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
        badgeLabel: 'On my TODO list',
        badgeVariant: 'secondary',
        isDisabled: true
      },
      /* COMMENTED OUT - Full configuration
      localization: {
        type: 'field-group',
        label: 'Currency Settings',
        collapsible: true,
        collapsibleDefaultOpen: false,
        
        fields: {
      localization: {
        type: 'field-group',
        label: 'Currency Settings',
        collapsible: true,
        collapsibleDefaultOpen: false,
        
        fields: {
          defaultCurrency: {
            type: 'select',
            label: 'Default Currency',
            description: 'The default currency for the donation form',
            placeholder: 'Select currency',
            options: [
              { value: 'USD', label: 'USD - US Dollar' },
              { value: 'EUR', label: 'EUR - Euro' },
              { value: 'GBP', label: 'GBP - British Pound' },
              { value: 'CAD', label: 'CAD - Canadian Dollar' }
            ],
            rules: z.string().min(1, 'Default currency is required')
          },
          supportedCurrencies: {
            type: 'array',
            label: 'Supported Currencies',
            description: 'List of currencies available to donors',
            itemField: {
              type: 'field-group',
              class: 'grid grid-cols-3 gap-3',
              fields: {
                code: {
                  type: 'text',
                  label: 'Currency Code',
                  placeholder: 'USD',
                  rules: z.string().length(3, 'Must be 3 characters')
                },
                label: {
                  type: 'text',
                  label: 'Label',
                  placeholder: 'US Dollar',
                  rules: z.string().min(1, 'Label is required')
                },
                symbol: {
                  type: 'text',
                  label: 'Symbol',
                  placeholder: '$',
                  rules: z.string().min(1, 'Symbol is required')
                }
              }
            },
            addButtonText: 'Add Currency',
            rules: z
              .array(
                z.object({
                  code: z.string().length(3),
                  label: z.string().min(1),
                  symbol: z.string().min(1)
                })
              )
              .min(1, 'At least one currency must be supported')
          }
        }
      },
      */
      pricing: {
        type: 'field-group',
        label: 'Pricing Configuration',
        collapsible: true,
        collapsibleDefaultOpen: false,
        badgeLabel: 'On my TODO list',
        badgeVariant: 'secondary',
        isDisabled: true
      }
      /* COMMENTED OUT - Full configuration
      pricing: {
        type: 'field-group',
        label: 'Pricing Configuration',
        collapsible: true,
        collapsibleDefaultOpen: false,
        
        fields: {
      pricing: {
        type: 'field-group',
        label: 'Pricing Configuration',
        collapsible: true,
        collapsibleDefaultOpen: false,
        
        fields: {
          baseCurrency: {
            type: 'text',
            label: 'Base Currency',
            description: 'The currency used for internal calculations',
            placeholder: 'USD',
            rules: z.string().length(3, 'Must be 3 characters')
          },
          frequencies: {
            type: 'array',
            label: 'Donation Frequencies',
            description: 'Configure available donation frequencies and their preset amounts',
            itemField: {
              type: 'field-group',
              
              fields: {
                value: {
                  type: 'select',
                  label: 'Frequency Type',
                  placeholder: 'Select frequency',
                  options: [
                    { value: 'once', label: 'One-time' },
                    { value: 'monthly', label: 'Monthly' },
                    { value: 'yearly', label: 'Yearly' }
                  ],
                  rules: z.enum(['once', 'monthly', 'yearly'])
                },
                label: {
                  type: 'text',
                  label: 'Display Label',
                  placeholder: 'One-time',
                  rules: z.string().min(1, 'Label is required')
                },
                presetAmounts: {
                  type: 'array',
                  label: 'Preset Amounts',
                  description: 'Comma-separated preset donation amounts',
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
            addButtonText: 'Add Frequency',
            rules: z
              .array(
                z.object({
                  value: z.enum(['once', 'monthly', 'yearly']),
                  label: z.string().min(1),
                  presetAmounts: z.array(z.number()).min(1),
                  customAmount: z.object({
                    min: z.number().min(1),
                    max: z.number().min(1)
                  })
                })
              )
              .min(1, 'At least one frequency must be configured')
          }
        }
      }
      */
    }
  }
}
