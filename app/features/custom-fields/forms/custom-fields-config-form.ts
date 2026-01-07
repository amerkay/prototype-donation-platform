import * as z from 'zod'
import type {
  FormDef,
  FieldMeta,
  ArrayItemContext,
  FieldContext
} from '~/features/form-builder/types'
import { FIELD_FACTORIES, type CustomFieldType, slugify } from '~/features/custom-fields/fields'
import type { ContextSchema } from '~/features/form-builder/conditions'
import type { AvailableField } from '~/features/form-builder/composables/useAvailableFields'
import { buildConditionItemField } from './condition-field-builder'
import { validateCustomFieldConditions } from './validation-helpers'

/**
 * Extract field metadata from preceding custom fields in the array
 * This allows condition builder to reference fields that come before the current one
 */
function extractPrecedingFields(
  items: Record<string, unknown>[],
  currentIndex: number
): AvailableField[] {
  const fields: AvailableField[] = []

  // Only include fields that come BEFORE the current one
  for (let i = 0; i < currentIndex; i++) {
    const item = items[i]
    if (!item) continue

    const fieldType = item.type as CustomFieldType | undefined
    const fieldId = item.id as string | undefined
    const fieldLabel = item.label as string | undefined

    // Only include fields that have been properly configured
    if (!fieldType || !fieldId || !fieldLabel) continue

    // Map custom field types to form builder types
    let type: 'string' | 'number' | 'boolean' | 'array' = 'string'
    let options: Array<{ value: string | number; label: string }> | undefined = undefined

    if (fieldType === 'number' || fieldType === 'slider') {
      type = 'number'
    } else if (fieldType === 'checkbox' && !item.options) {
      type = 'boolean'
    } else if (
      (fieldType === 'select' || fieldType === 'radio-group' || fieldType === 'checkbox') &&
      item.options
    ) {
      const opts = item.options as string[] | Array<{ value: string; label: string }>
      if (Array.isArray(opts) && opts.length > 0) {
        if (typeof opts[0] === 'string') {
          options = (opts as string[]).map((opt) => ({
            value: opt,
            label: opt
          }))
        } else {
          options = opts as Array<{ value: string; label: string }>
        }
      }
    }

    fields.push({
      key: fieldId,
      label: fieldLabel,
      type,
      group: 'Form Fields',
      options
    })
  }

  return fields
}

/**
 * Create custom fields config section definition (V3 - Factory-Based with Function itemField)
 * Returns the form configuration for editing custom fields in admin
 *
 * Uses field-specific factories and dynamic itemField resolution based on selected type.
 * Each field type's configuration is loaded from its own factory module.
 *
 * @param contextSchema - Optional external context schema for condition builder
 */
export function createCustomFieldsConfigSection(contextSchema?: ContextSchema): FormDef {
  return {
    id: 'customFields',
    fields: {
      enabled: {
        type: 'toggle',
        label: 'Enable Custom Fields',
        description: 'Add extra questions to form',
        labelClass: 'font-bold',
        isSeparatorAfter: true
      },
      fields: {
        type: 'array',
        onChange: ({ value, setFieldError, setFieldTouched, path }) => {
          if (Array.isArray(value) && setFieldError && setFieldTouched && path) {
            validateCustomFieldConditions(value as Record<string, unknown>[], contextSchema, path, {
              setFieldError,
              setFieldTouched
            })
          }
        },
        label: 'Custom Fields',
        description: 'Define additional form fields for donors to fill out',
        visibleWhen: ({ values }) => values.enabled === true,
        sortable: true,
        addButtonText: 'Add Custom Field',
        isSeparatorAfter: true,
        // Dynamic itemField based on selected type - resolved per-item using function
        itemField: (values: Record<string, unknown>, context: ArrayItemContext) => {
          const type = values.type as CustomFieldType | undefined
          const label = (values.label as string) || ''

          // Extract preceding fields for condition builder
          const precedingFields = extractPrecedingFields(context.items, context.index)

          // Generate dynamic label for accordion
          const displayLabel = (() => {
            if (!label && !type) return 'New Custom Field'
            if (!label) return type ? type.charAt(0).toUpperCase() + type.slice(1) : 'New Field'

            const typeDisplay = type ? type.charAt(0).toUpperCase() + type.slice(1) : ''
            const maxLabelLength = 35
            const truncatedLabel =
              label.length > maxLabelLength ? label.substring(0, maxLabelLength) + '...' : label

            return typeDisplay ? `${typeDisplay}: ${truncatedLabel}` : truncatedLabel
          })()

          // Build fields object dynamically based on selected type
          const fields: Record<string, FieldMeta> = {
            // ============================================================
            // STEP 1: Field Type Selection (always visible)
            // ============================================================
            type: {
              type: 'select',
              label: 'Field Type',
              placeholder: 'Choose field type...',
              options: [
                { value: 'text', label: 'Text (single line)' },
                { value: 'textarea', label: 'Textarea (multi-line)' },
                { value: 'number', label: 'Number' },
                { value: 'slider', label: 'Slider (range)' },
                { value: 'select', label: 'Dropdown (select)' },
                { value: 'checkbox', label: 'Checkbox' },
                { value: 'radio-group', label: 'Radio Group' },
                { value: 'hidden', label: 'Hidden (tracking)' }
              ],
              disabled: ({ values }) => !!values.type,
              rules: z.enum(
                [
                  'text',
                  'textarea',
                  'number',
                  'slider',
                  'select',
                  'checkbox',
                  'radio-group',
                  'hidden'
                ],
                {
                  message: 'Please select a field type'
                }
              ),
              // Return factory config - framework auto-applies defaults
              onChange: ({ value }) => {
                const selectedType = value as CustomFieldType | undefined
                if (selectedType && selectedType in FIELD_FACTORIES) {
                  return FIELD_FACTORIES[selectedType].createAdminConfig()
                }
              }
            },

            // Auto-generated ID (hidden)
            id: {
              type: 'text',
              label: '',
              defaultValue: '',
              visibleWhen: () => false,
              rules: z.string().min(1)
            },

            // ============================================================
            // STEP 2: Common Fields (shown after type is selected)
            // ============================================================
            label: {
              type: 'text',
              label: 'Field Label',
              placeholder: 'What is your question?',
              visibleWhen: ({ values }) => !!values.type,
              rules: z.string().min(1, 'Label is required'),
              isSeparatorAfter: true,
              onChange: ({ value, values, setValue }) => {
                const labelStr = (value as string) || ''
                const typeStr = (values.type as string) || 'field'
                const slugified = slugify(labelStr, 50) || 'question'
                setValue('id', `${typeStr}_${slugified}`)
              }
            }
          }

          // ============================================================
          // STEP 3: Type-Specific Config (loaded from factory)
          // ============================================================
          if (type && type in FIELD_FACTORIES) {
            const factory = FIELD_FACTORIES[type]
            const adminConfig = factory.createAdminConfig()

            if (adminConfig.advancedSettings) {
              adminConfig.advancedSettings.isSeparatorAfter = true
            }

            // Merge factory-generated fields into the config
            Object.assign(fields, adminConfig)
          }

          // ============================================================
          // STEP 4: Visibility Conditions (last, after all configs)
          // ============================================================
          Object.assign(fields, {
            enableVisibilityConditions: {
              type: 'toggle',
              label: 'Enable Visibility Conditions',
              description: 'Control when this field is shown based on other field values',
              defaultValue: false,
              visibleWhen: ({ values }: FieldContext) => !!values.type,
              optional: true
            },

            visibilityConditions: {
              type: 'field-group',
              label: 'Condition Rules',
              visibleWhen: ({ values }: FieldContext) =>
                !!values.type && values.enableVisibilityConditions === true,
              class: 'bg-muted rounded-md py-4 px-3 sm:px-4',
              fields: {
                visibleWhen: {
                  type: 'field-group',
                  label: 'Show this field when',
                  optional: true,
                  fields: {
                    match: {
                      type: 'radio-group',
                      label: 'Match',
                      defaultValue: 'all',
                      orientation: 'horizontal',
                      options: [
                        { value: 'all', label: 'All match' },
                        { value: 'any', label: 'Any match' },
                        { value: 'none', label: 'None match' }
                      ]
                    },

                    conditions: {
                      type: 'array',
                      label: 'Conditions',
                      defaultValue: [],
                      addButtonText: 'Add Condition',
                      optional: true,
                      // Use extracted condition field builder
                      itemField: buildConditionItemField(precedingFields, contextSchema)
                    }
                  }
                }
              }
            }
          })

          return {
            type: 'field-group',
            label: displayLabel,
            collapsible: true,
            collapsibleDefaultOpen: !type, // Open if no type selected yet
            fields
          }
        }
      }
    }
  }
}
