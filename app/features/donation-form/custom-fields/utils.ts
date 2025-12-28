import * as z from 'zod'
import type { FormDef, FieldMetaMap } from '~/features/form-builder/types'
import type { CustomFieldDefinition } from './types'

/**
 * Convert custom field definition to form-builder FieldMeta
 * Maps admin config structure to runtime form field structure
 */
function customFieldToFieldMeta(field: CustomFieldDefinition): FieldMetaMap {
  // Get unified field config
  const config = field.fieldConfig || {}
  const optional = config.optional ?? true // Default to true

  // Hidden fields are never visible to users
  if (field.type === 'hidden') {
    return {
      [field.id]: {
        type: 'text',
        label: field.label,
        defaultValue: (config.defaultValue as string) ?? '',
        visibleWhen: () => false,
        rules: z.string().optional()
      }
    }
  }

  // Determine defaultValue based on field type
  const getDefaultValue = () => {
    if (config.defaultValue !== undefined) {
      return config.defaultValue
    }
    // Provide type-appropriate defaults when not specified
    switch (field.type) {
      case 'text':
      case 'textarea':
      case 'select':
        return ''
      case 'slider':
        return config.min ?? 0
      default:
        return undefined
    }
  }

  const baseProps = {
    label: field.label,
    placeholder: config.placeholder,
    optional,
    defaultValue: getDefaultValue()
  }

  switch (field.type) {
    case 'text': {
      return {
        [field.id]: {
          type: 'text',
          ...baseProps,
          maxLength: config.maxLength,
          rules: optional ? z.string().optional() : z.string().min(1, `${field.label} is required`)
        }
      }
    }

    case 'textarea': {
      return {
        [field.id]: {
          type: 'textarea',
          ...baseProps,
          rows: config.rows,
          maxLength: config.maxLength,
          rules: optional ? z.string().optional() : z.string().min(1, `${field.label} is required`)
        }
      }
    }

    case 'slider': {
      const min = config.min ?? 0
      const max = config.max ?? 100
      const step = config.step ?? 1

      return {
        [field.id]: {
          type: 'slider',
          ...baseProps,
          min,
          max,
          step,
          prefix: config.prefix,
          suffix: config.suffix,
          showMinMax: true,
          rules: optional
            ? z.number().min(min).max(max).optional()
            : z.number().min(min, `Must be at least ${min}`).max(max, `Must be at most ${max}`)
        }
      }
    }

    case 'select': {
      const optionLabels = config.options ?? []

      // Convert string array to {value, label} objects (auto-generate values from labels)
      const options = optionLabels.map((label) => ({
        value: String(label)
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '_')
          .replace(/^_+|_+$/g, ''),
        label: String(label)
      }))

      return {
        [field.id]: {
          type: 'select',
          label: field.label,
          placeholder: config.placeholder,
          optional,
          defaultValue: (config.defaultValue as string) ?? '',
          options,
          rules: optional ? z.string().optional() : z.string().min(1, `${field.label} is required`)
        }
      }
    }

    default:
      return {}
  }
}

/**
 * Convert array of custom field definitions to a FormDef section
 * Used to dynamically generate form fields for step 3
 *
 * @param customFields - Array of custom field definitions from admin config
 * @returns FormDef object ready for FormRenderer
 *
 * @example
 * ```typescript
 * const customFieldsSection = createCustomFieldsFormSection(config.customFields.fields)
 * <FormRenderer :section="customFieldsSection" v-model="data" />
 * ```
 */
export function createCustomFieldsFormSection(customFields: CustomFieldDefinition[]): FormDef {
  const fields: FieldMetaMap = {}

  // Convert each custom field definition to FieldMeta
  for (const field of customFields) {
    const fieldMeta = customFieldToFieldMeta(field)
    Object.assign(fields, fieldMeta)
  }

  return {
    id: 'customFields',
    // title: 'Additional Information',
    fields
  }
}

/**
 * Extract default values from custom field definitions
 * Returns an object with field IDs as keys and default values
 *
 * @param customFields - Array of custom field definitions from admin config
 * @returns Object with default values for each field that has one
 */
export function extractCustomFieldDefaults(
  customFields: CustomFieldDefinition[]
): Record<string, unknown> {
  const defaults: Record<string, unknown> = {}

  for (const field of customFields) {
    const config = field.fieldConfig || {}
    const defaultValue = config.defaultValue

    if (defaultValue !== undefined) {
      defaults[field.id] = defaultValue
    }
  }

  return defaults
}
