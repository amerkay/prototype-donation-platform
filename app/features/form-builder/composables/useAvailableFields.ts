/**
 * Composable to provide available fields for condition builder dropdown
 * Extracts form fields and external context fields with metadata for UI display
 */

import { computed } from 'vue'
import type { FieldMeta, FieldContext } from '~/features/form-builder/types'
import type { ContextSchema, ContextFieldOption } from '~/features/form-builder/conditions'
import { resolveText } from './useResolvedFieldMeta'
import { useFormBuilderContext } from './useFormBuilderContext'
/**
 * Available field definition for condition builder
 */
export interface AvailableField {
  /** Field key/path (dot notation for nested fields) */
  key: string

  /** Human-readable label */
  label: string

  /** Field data type */
  type: 'string' | 'number' | 'boolean' | 'array'

  /** Predefined options for select/radio/checkbox fields */
  options?: ContextFieldOption[]

  /** Group identifier for UI organization */
  group: 'Form Fields' | 'External Context'
}

/**
 * Recursively extract fields from form definition
 * Flattens nested field-groups and tabs with dot-notation paths
 */
function extractFormFields(
  fields: Record<string, FieldMeta>,
  prefix: string = '',
  ctx: FieldContext
): AvailableField[] {
  const result: AvailableField[] = []

  for (const [key, meta] of Object.entries(fields)) {
    const fullKey = prefix ? `${prefix}.${key}` : key

    // Skip container fields (field-group, tabs, array, card)
    if (
      meta.type === 'field-group' ||
      meta.type === 'tabs' ||
      meta.type === 'array' ||
      meta.type === 'card'
    ) {
      // Recursively extract children for field-group
      if (meta.type === 'field-group' && 'fields' in meta && meta.fields) {
        result.push(...extractFormFields(meta.fields, fullKey, ctx))
      }

      // Recursively extract children for tabs
      if (meta.type === 'tabs' && 'tabs' in meta) {
        for (const tab of meta.tabs) {
          const tabKey = `${fullKey}.${tab.value}`
          result.push(...extractFormFields(tab.fields, tabKey, ctx))
        }
      }

      continue
    }

    // Extract label (resolve dynamic functions)
    const label = resolveText(meta.label, ctx) || key

    // Map form field type to condition type
    let conditionType: 'string' | 'number' | 'boolean' | 'array' = 'string'
    if (meta.type === 'number' || meta.type === 'currency' || meta.type === 'slider') {
      conditionType = 'number'
    } else if (meta.type === 'toggle') {
      conditionType = 'boolean'
    } else if (meta.type === 'checkbox' && 'options' in meta && Array.isArray(meta.options)) {
      // Multi-select checkbox
      conditionType = 'array'
    }

    // Extract options for select/radio/checkbox fields
    let options: ContextFieldOption[] | undefined
    if ('options' in meta && Array.isArray(meta.options)) {
      options = meta.options.map((opt) => {
        if (typeof opt === 'string') {
          return { value: opt, label: opt }
        }
        return { value: opt.value, label: opt.label }
      })
    }

    result.push({
      key: fullKey,
      label,
      type: conditionType,
      options,
      group: 'Form Fields'
    })
  }

  return result
}

/**
 * Extract fields from external context schema
 */
function extractContextFields(contextSchema: ContextSchema): AvailableField[] {
  const result: AvailableField[] = []

  for (const [key, schema] of Object.entries(contextSchema)) {
    result.push({
      key,
      label: schema.label,
      type: schema.type,
      options: schema.options,
      group: 'External Context'
    })
  }

  return result
}

/**
 * Composable to get available fields for condition builder
 * Combines form fields and external context fields
 *
 * @param formFields - Optional form field definitions (if not provided, uses injected context)
 * @returns Computed array of available fields
 */
export function useAvailableFields(formFields?: Record<string, FieldMeta>) {
  // Get context schema from FormRenderer via useFormBuilderContext
  const { contextSchema, fieldContext } = useFormBuilderContext()

  const availableFields = computed<AvailableField[]>(() => {
    const fields: AvailableField[] = []

    // Extract form fields if provided
    if (formFields) {
      fields.push(...extractFormFields(formFields, '', fieldContext.value))
    }

    // Extract external context fields
    fields.push(...extractContextFields(contextSchema.value))

    return fields
  })

  return {
    availableFields
  }
}
