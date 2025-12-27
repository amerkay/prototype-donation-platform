import * as z from 'zod'
import type { FormDef } from '~/features/form-builder/types'

/**
 * Create custom fields config section definition
 * Returns the form configuration for editing custom fields in admin
 */
export function createCustomFieldsConfigSection(): FormDef {
  return {
    id: 'customFields',
    fields: {
      enabled: {
        type: 'toggle',
        label: 'Enable Custom Fields',
        description: 'Add extra questions to step 3 of the donation form',
        labelClass: 'font-bold'
      },
      fields: {
        type: 'array',
        label: 'Custom Fields',
        description: 'Define additional form fields for donors to fill out',
        visibleWhen: (values) => values.enabled === true,
        sortable: true,
        addButtonText: 'Add Custom Field',
        itemField: {
          type: 'field-group',
          label: (values) => {
            const type = ((values as Record<string, unknown>)?.type as string) || ''
            const label = ((values as Record<string, unknown>)?.label as string) || ''

            // Show "New Custom Field" if empty
            if (!type && !label) return 'New Custom Field'

            // Capitalize field type for display
            const typeDisplay = type.charAt(0).toUpperCase() + type.slice(1)

            // Truncate label if too long (keep under ~50 chars total)
            const maxLabelLength = 35
            const truncatedLabel =
              label.length > maxLabelLength ? label.substring(0, maxLabelLength) + '...' : label

            // Show "Type: Label" format, or just one if the other is missing
            if (type && label) return `${typeDisplay}: ${truncatedLabel}`
            return label || typeDisplay
          },
          collapsible: true,
          collapsibleDefaultOpen: false,
          fields: {
            // Field identification
            id: {
              type: 'text',
              label: 'Field ID',
              description: 'Unique identifier (no spaces, letters and underscores only)',
              placeholder: 'field_name',
              rules: z
                .string()
                .min(1, 'Field ID is required')
                .regex(/^[a-z_]+$/, 'Only lowercase letters and underscores allowed')
            },

            // Type selector
            type: {
              type: 'select',
              label: 'Field Type',
              placeholder: 'Select field type',
              options: [
                { value: 'text', label: 'Text (single line)' },
                { value: 'textarea', label: 'Textarea (multi-line)' },
                { value: 'slider', label: 'Slider (number range)' },
                { value: 'select', label: 'Dropdown (select options)' }
              ],
              rules: z.enum(['text', 'textarea', 'slider', 'select'], {
                message: 'Please select a field type'
              })
            },

            // Common fields (all types)
            label: {
              type: 'text',
              label: 'Field Label',
              placeholder: 'What is your question?',
              rules: z.string().min(1, 'Label is required')
            },
            placeholder: {
              type: 'text',
              label: 'Placeholder Text',
              description: 'Hint text shown inside the field',
              placeholder: 'Enter your answer...',
              optional: true,
              visibleWhen: (values) =>
                ['text', 'textarea', 'select'].includes(values.type as string)
            },
            optional: {
              type: 'toggle',
              label: 'Optional Field',
              description: 'Allow donors to skip this field',
              optional: true
            },
            hidden: {
              type: 'toggle',
              label: 'Hidden Field',
              description: 'Field is hidden from donors (for tracking purposes)',
              optional: true
            },

            // Text-specific config
            textConfig: {
              type: 'field-group',
              label: 'Text Field Settings',
              visibleWhen: (values) => values.type === 'text',
              collapsible: true,
              collapsibleDefaultOpen: false,
              fields: {
                maxLength: {
                  type: 'number',
                  label: 'Maximum Length',
                  description: 'Maximum number of characters allowed',
                  placeholder: '100',
                  min: 1,
                  max: 500,
                  optional: true
                }
              }
            },

            // Textarea-specific config
            textareaConfig: {
              type: 'field-group',
              label: 'Textarea Settings',
              visibleWhen: (values) => values.type === 'textarea',
              collapsible: true,
              collapsibleDefaultOpen: false,
              fields: {
                rows: {
                  type: 'number',
                  label: 'Number of Rows',
                  description: 'Height of the textarea',
                  placeholder: '3',
                  min: 2,
                  max: 10,
                  optional: true
                },
                maxLength: {
                  type: 'number',
                  label: 'Maximum Length',
                  description: 'Maximum number of characters allowed',
                  placeholder: '500',
                  min: 1,
                  max: 2000,
                  optional: true
                }
              }
            },

            // Slider-specific config
            sliderConfig: {
              type: 'field-group',
              label: 'Slider Settings',
              visibleWhen: (values) => values.type === 'slider',
              collapsible: true,
              collapsibleDefaultOpen: false,
              rules: z
                .object({
                  min: z.number(),
                  max: z.number(),
                  step: z.number().optional()
                })
                .refine((data) => data.min < data.max, {
                  message: 'Minimum must be less than maximum',
                  path: ['min']
                }),
              fields: {
                min: {
                  type: 'number',
                  label: 'Minimum Value',
                  placeholder: '0',
                  rules: z.number()
                },
                max: {
                  type: 'number',
                  label: 'Maximum Value',
                  placeholder: '100',
                  rules: z.number()
                },
                step: {
                  type: 'number',
                  label: 'Step Size',
                  description: 'Increment value for slider',
                  placeholder: '1',
                  min: 1,
                  optional: true
                },
                prefix: {
                  type: 'text',
                  label: 'Prefix',
                  description: 'Text before the value (e.g., "$")',
                  placeholder: '$',
                  maxLength: 5,
                  optional: true
                },
                suffix: {
                  type: 'text',
                  label: 'Suffix',
                  description: 'Text after the value (e.g., "%")',
                  placeholder: '%',
                  maxLength: 10,
                  optional: true
                }
              }
            },

            // Select-specific config
            selectConfig: {
              type: 'field-group',
              label: 'Dropdown Settings',
              visibleWhen: (values) => values.type === 'select',
              collapsible: true,
              collapsibleDefaultOpen: false,
              fields: {
                options: {
                  type: 'array',
                  label: 'Dropdown Options',
                  description: 'Define the options available in the dropdown',
                  addButtonText: 'Add Option',
                  sortable: true,
                  rules: z
                    .array(
                      z.object({
                        value: z.string(),
                        label: z.string()
                      })
                    )
                    .min(1, 'At least one option is required'),
                  itemField: {
                    type: 'field-group',
                    class: 'grid grid-cols-2 gap-2',
                    fields: {
                      value: {
                        type: 'text',
                        label: 'Value',
                        placeholder: 'option_value',
                        rules: z.string().min(1, 'Value is required')
                      },
                      label: {
                        type: 'text',
                        label: 'Label',
                        placeholder: 'Option Label',
                        rules: z.string().min(1, 'Label is required')
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  }
}
