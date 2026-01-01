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
        labelClass: 'font-bold',
        isSeparatorAfter: true
      },
      fields: {
        type: 'array',
        label: 'Custom Fields',
        description: 'Define additional form fields for donors to fill out',
        visibleWhen: (values) => values.enabled === true,
        sortable: true,
        addButtonText: 'Add Custom Field',
        isSeparatorAfter: true,
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
            // Type selector (FIRST - everything else depends on this)
            type: {
              type: 'select',
              label: 'Field Type',
              defaultValue: 'text', // Default to text so label/id fields are immediately visible
              options: [
                { value: 'text', label: 'Text (single line)' },
                { value: 'textarea', label: 'Textarea (multi-line)' },
                { value: 'slider', label: 'Slider (number range)' },
                { value: 'select', label: 'Dropdown (select options)' },
                { value: 'hidden', label: 'Hidden (tracking field)' }
              ],
              rules: z.enum(['text', 'textarea', 'slider', 'select', 'hidden'], {
                message: 'Please select a field type'
              })
            },

            // Field identification (auto-generated from label)
            id: {
              type: 'text',
              label: '',
              defaultValue: '', // Initialize as empty so setValue can update it
              visibleWhen: () => false, // Hidden - auto-generated
              rules: z.string().min(1)
            },

            // Common fields (shown after type is selected)
            label: {
              type: 'text',
              label: 'Field Label',
              placeholder: 'What is your question?',
              visibleWhen: (values) => !!values.type,
              rules: z.string().min(1, 'Label is required'),
              onChange: (value, allValues, setValue) => {
                // Auto-generate ID from label with field type prefix (e.g., text_company_name)
                const label = (value as string) || ''
                const type = ((allValues as Record<string, unknown>).type as string) || 'field'
                const slugified =
                  label
                    .toLowerCase()
                    .replace(/[^a-z0-9]+/g, '_')
                    .replace(/^_+|_+$/g, '')
                    .substring(0, 50) || 'question'
                setValue('id', `${type}_${slugified}`)
              }
            },

            // Dropdown options (select only) - must come before defaultValue for reactivity
            'fieldConfig.options': {
              type: 'array',
              label: 'Dropdown Options',
              description: 'Define the options available in the dropdown (values auto-generated)',
              visibleWhen: (values) => values.type === 'select',
              addButtonText: 'Add Option',
              sortable: true,
              rules: z
                .array(z.string().min(1, 'Option is required'))
                .min(1, 'At least one option is required'),
              itemField: {
                type: 'text',
                label: '',
                placeholder: 'Option name',
                rules: z.string().min(1, 'Option is required')
              }
            },

            // Unified field configuration (adapts to field type)
            fieldConfig: {
              type: 'field-group',
              label: 'Field Settings',
              defaultValue: { optional: true },
              visibleWhen: (values) => !!values.type && values.type !== 'hidden',
              collapsible: true,
              collapsibleDefaultOpen: false,
              rules: (values) => {
                // Apply slider-specific validation when type is slider
                if ((values as Record<string, unknown>).type === 'slider') {
                  return z
                    .object({
                      min: z.number(),
                      max: z.number(),
                      step: z.number().optional(),
                      defaultValue: z.number().optional(),
                      prefix: z.string().optional(),
                      suffix: z.string().optional()
                    })
                    .refine(
                      (data) => {
                        if (data.defaultValue !== undefined) {
                          return data.defaultValue >= data.min && data.defaultValue <= data.max
                        }
                        return true
                      },
                      {
                        message: 'Default value must be between min and max',
                        path: ['defaultValue']
                      }
                    )
                    .refine((data) => data.min < data.max, {
                      message: 'Minimum must be less than maximum',
                      path: ['min']
                    })
                }
                return z.object({}).optional()
              },
              fields: {
                // Optional toggle (all types except hidden)
                optional: {
                  type: 'toggle',
                  label: 'Optional Field',
                  description: 'Allow donors to skip this field',
                  optional: true,
                  visibleWhen: (values) => {
                    const type = (values as Record<string, unknown>).type
                    return type !== 'hidden'
                  }
                },

                // Placeholder (text, textarea, select)
                placeholder: {
                  type: 'text',
                  label: 'Placeholder Text',
                  description: (values) => {
                    const type = (values as Record<string, unknown>).type as string
                    if (type === 'select') return 'Hint text shown when no option is selected'
                    return 'Hint text shown inside the field'
                  },
                  placeholder: (values) => {
                    const type = (values as Record<string, unknown>).type as string
                    if (type === 'select') return 'Select an option...'
                    return 'Enter your answer...'
                  },
                  optional: true,
                  visibleWhen: (values) => {
                    const type = (values as Record<string, unknown>).type
                    return type === 'text' || type === 'textarea' || type === 'select'
                  }
                },

                // Default value for text/textarea
                defaultValue: {
                  type: 'text',
                  label: 'Default Value',
                  description: 'Pre-fill this value when the form loads',
                  placeholder: 'Enter default value...',
                  optional: true,
                  visibleWhen: (values) => {
                    const type = (values as Record<string, unknown>).type
                    return type === 'text' || type === 'textarea'
                  }
                },

                // Default value for slider (slider field that respects min/max/step/prefix/suffix)
                sliderDefault: {
                  type: 'slider',
                  label: 'Default Value',
                  description: 'Pre-set the slider to this value',
                  optional: true,
                  visibleWhen: (values) => (values as Record<string, unknown>).type === 'slider',
                  min: (values) => ((values as Record<string, unknown>).min as number) || 0,
                  max: (values) => ((values as Record<string, unknown>).max as number) || 100,
                  step: (values) => ((values as Record<string, unknown>).step as number) || 1,
                  prefix: (values) =>
                    ((values as Record<string, unknown>).prefix as string) || undefined,
                  suffix: (values) =>
                    ((values as Record<string, unknown>).suffix as string) || undefined,
                  showMinMax: true,
                  onChange: (value, _allValues, setValue) => {
                    // Sync to actual defaultValue that gets stored in API
                    setValue('defaultValue', value)
                  }
                },

                // Default value for select (dropdown showing available options)
                selectDefault: {
                  type: 'select',
                  label: 'Default Value',
                  description: 'Pre-select this option when the form loads',
                  placeholder: 'Select default option...',
                  optional: true,
                  visibleWhen: (values) => (values as Record<string, unknown>).type === 'select',
                  options: (values) => {
                    const config = values as Record<string, unknown>
                    const optionLabels = (config.options as string[]) || []
                    // Map to {value: slugified, label: original} for display
                    return optionLabels.map((label) => ({
                      value: String(label)
                        .toLowerCase()
                        .replace(/[^a-z0-9]+/g, '_')
                        .replace(/^_+|_+$/g, ''),
                      label: String(label)
                    }))
                  },
                  onChange: (value, _allValues, setValue) => {
                    // Sync slugified value to defaultValue
                    setValue('defaultValue', value)
                  }
                },

                // Rows (textarea only)
                rows: {
                  type: 'number',
                  label: 'Number of Rows',
                  description: 'Height of the textarea',
                  placeholder: '3',
                  min: 2,
                  max: 10,
                  optional: true,
                  visibleWhen: (values) => (values as Record<string, unknown>).type === 'textarea'
                },

                // Max length (text, textarea)
                maxLength: {
                  type: 'number',
                  label: 'Maximum Length',
                  description: 'Maximum number of characters allowed',
                  placeholder: (values) =>
                    (values as Record<string, unknown>).type === 'textarea' ? '500' : '100',
                  min: 1,
                  max: 2000,
                  optional: true,
                  visibleWhen: (values) => {
                    const type = (values as Record<string, unknown>).type
                    return type === 'text' || type === 'textarea'
                  }
                },

                // Slider-specific fields
                min: {
                  type: 'number',
                  label: 'Minimum Value',
                  placeholder: '0',
                  defaultValue: 0,
                  rules: z.number(),
                  visibleWhen: (values) => (values as Record<string, unknown>).type === 'slider'
                },
                max: {
                  type: 'number',
                  label: 'Maximum Value',
                  placeholder: '100',
                  defaultValue: 100,
                  rules: z.number(),
                  visibleWhen: (values) => (values as Record<string, unknown>).type === 'slider'
                },
                step: {
                  type: 'number',
                  label: 'Step Size',
                  description: 'Increment value for slider',
                  placeholder: '1',
                  defaultValue: 5,
                  min: 1,
                  optional: true,
                  visibleWhen: (values) => (values as Record<string, unknown>).type === 'slider'
                },
                prefix: {
                  type: 'text',
                  label: 'Prefix',
                  description: 'Text before the value (e.g., "$")',
                  placeholder: '$',
                  maxLength: 5,
                  optional: true,
                  visibleWhen: (values) => (values as Record<string, unknown>).type === 'slider'
                },
                suffix: {
                  type: 'text',
                  label: 'Suffix',
                  description: 'Text after the value (e.g., "%")',
                  placeholder: '%',
                  maxLength: 10,
                  optional: true,
                  visibleWhen: (values) => (values as Record<string, unknown>).type === 'slider'
                }
              }
            },

            // Hidden field value (required) - outside fieldConfig since it's special
            'fieldConfig.defaultValue': {
              type: 'text',
              label: 'Value',
              description: 'The value stored for this hidden tracking field',
              placeholder: 'utm_source',
              visibleWhen: (values) => values.type === 'hidden',
              rules: z.string().min(1, 'Value is required for hidden fields')
            }
          }
        }
      }
    }
  }
}
