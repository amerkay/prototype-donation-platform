import * as z from 'zod'
import type { FormDef, FieldMetaMap } from '~/features/form-builder/types'
import type { CustomFieldDefinition } from './types'

/**
 * Convert custom field definition to form-builder FieldMeta
 * Maps admin config structure to runtime form field structure
 */
function customFieldToFieldMeta(field: CustomFieldDefinition): FieldMetaMap {
  const baseProps = {
    label: field.label,
    placeholder: field.placeholder,
    optional: field.optional ?? false,
    visibleWhen: field.hidden ? () => false : undefined
  }

  switch (field.type) {
    case 'text': {
      // Read from textConfig if it exists, otherwise fall back to top-level
      const textConfig = field.textConfig || {}
      return {
        [field.id]: {
          type: 'text',
          ...baseProps,
          maxLength: textConfig.maxLength ?? field.maxLength,
          rules: field.optional
            ? z.string().optional()
            : z.string().min(1, `${field.label} is required`)
        }
      }
    }

    case 'textarea': {
      // Read from textareaConfig if it exists, otherwise fall back to top-level
      const textareaConfig = field.textareaConfig || {}
      return {
        [field.id]: {
          type: 'textarea',
          ...baseProps,
          rows: textareaConfig.rows ?? field.rows,
          maxLength: textareaConfig.maxLength ?? field.maxLength,
          rules: field.optional
            ? z.string().optional()
            : z.string().min(1, `${field.label} is required`)
        }
      }
    }

    case 'slider': {
      // Read from sliderConfig if it exists, otherwise fall back to top-level
      const sliderConfig = field.sliderConfig || {}
      const min = sliderConfig.min ?? field.min ?? 0
      const max = sliderConfig.max ?? field.max ?? 100
      const step = sliderConfig.step ?? field.step ?? 1

      return {
        [field.id]: {
          type: 'slider',
          ...baseProps,
          min,
          max,
          step,
          prefix: sliderConfig.prefix ?? field.prefix,
          suffix: sliderConfig.suffix ?? field.suffix,
          showMinMax: true,
          rules: field.optional
            ? z.number().min(min).max(max).optional()
            : z.number().min(min, `Must be at least ${min}`).max(max, `Must be at most ${max}`)
        }
      }
    }

    case 'select': {
      // Read from selectConfig if it exists, otherwise fall back to top-level
      const selectConfig = field.selectConfig || {}
      const options = selectConfig.options ?? field.options ?? []

      return {
        [field.id]: {
          type: 'select',
          ...baseProps,
          options,
          rules: field.optional
            ? z.string().optional()
            : z.string().min(1, `${field.label} is required`)
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
