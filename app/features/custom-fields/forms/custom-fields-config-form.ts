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
import { extractAvailableFields } from './field-extraction'

/**
 * Create custom fields config section definition (V3 - Factory-Based with Function itemField)
 * Returns the form configuration for editing custom fields in admin
 *
 * Uses field-specific factories and dynamic itemField resolution based on selected type.
 * Each field type's configuration is loaded from its own factory module.
 *
 * @param contextSchema - Optional external context schema for condition builder
 * @param resolveExternalFields - Optional function to resolve external fields from root form values
 * @param allowedFieldTypes - Optional array of allowed field types. Defaults to all types.
 */
export function createCustomFieldsConfigSection(
  contextSchema?: ContextSchema,
  resolveExternalFields?: (rootValues: Record<string, unknown>) => AvailableField[],
  allowedFieldTypes?: CustomFieldType[]
): FormDef {
  // Default to all field types if not specified
  const fieldTypes = allowedFieldTypes || (Object.keys(FIELD_FACTORIES) as CustomFieldType[])

  // Build field type options and labels based on allowed types
  const fieldTypeOptions: Array<{ value: string; label: string }> = []
  const fieldTypeLabels: Record<string, string> = {
    text: 'Text (single line)',
    textarea: 'Textarea (multi-line)',
    number: 'Number',
    slider: 'Slider (range)',
    select: 'Dropdown (select)',
    checkbox: 'Checkbox',
    'radio-group': 'Radio Group',
    hidden: 'Hidden (tracking)'
  }

  for (const type of fieldTypes) {
    fieldTypeOptions.push({
      value: type,
      label: fieldTypeLabels[type] || type
    })
  }

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
        addButtonText:
          fieldTypes.length === 1 && fieldTypes[0]
            ? `Add ${fieldTypeLabels[fieldTypes[0]] || fieldTypes[0]} Field`
            : 'Add Custom Field',
        isSeparatorAfter: true,
        // Dynamic itemField based on selected type - resolved per-item using function
        itemField: (values: Record<string, unknown>, context: ArrayItemContext) => {
          const type = values.type as CustomFieldType | undefined
          const label = (values.label as string) || ''

          // Extract preceding fields for condition builder
          // Combine external fields (if resolved) + fields preceding this one in the current array
          const precedingFields: AvailableField[] = [
            ...(resolveExternalFields && context.root ? resolveExternalFields(context.root) : []),
            ...extractAvailableFields(context.items, context.index)
          ]

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
              options: fieldTypeOptions,
              defaultValue: fieldTypes.length === 1 ? fieldTypes[0] : undefined,
              disabled: ({ values }) => !!values.type,
              rules: z.enum(fieldTypes as [CustomFieldType, ...CustomFieldType[]], {
                message: 'Please select a field type'
              }),
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
              placeholder: ({ values }) => {
                const fieldType = values.type as CustomFieldType | undefined
                return fieldType === 'hidden'
                  ? 'e.g., utm_source, utm_campaign, referrer'
                  : 'What is your question?'
              },
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
              visibleWhen: ({ values }: FieldContext) => !!values.type && values.type !== 'hidden',
              optional: true
            },

            visibilityConditions: {
              type: 'field-group',
              label: 'Condition Rules',
              visibleWhen: ({ values }: FieldContext) =>
                !!values.type &&
                values.type !== 'hidden' &&
                values.enableVisibilityConditions === true,
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
                      rules: z.array(z.any()).min(1, 'At least one condition is required'),
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
            collapsibleDefaultOpen: !type || fieldTypes.length === 1, // Open if no type OR single type auto-selected
            fields
          }
        }
      }
    }
  }
}
