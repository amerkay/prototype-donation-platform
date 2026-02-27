/**
 * Composable to provide available fields for condition builder dropdown
 * Extracts form fields and external context fields with metadata for UI display
 */

import { computed } from 'vue'
import type { FieldDef, FieldContext } from '~/features/_library/form-builder/types'
import type { ContextFieldOption } from '~/features/_library/form-builder/conditions'
import { contextSchemaToFields } from '~/features/_library/form-builder/conditions/ui/condition-utils'
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
  group: string
}

const CONTAINER_TYPES = new Set(['field-group', 'tabs', 'array', 'card', 'alert'])

function mapFieldTypeToConditionType(
  fieldDef: FieldDef
): 'string' | 'number' | 'boolean' | 'array' {
  if (fieldDef.type === 'number' || fieldDef.type === 'currency' || fieldDef.type === 'slider') {
    return 'number'
  }
  if (fieldDef.type === 'toggle') return 'boolean'
  if (fieldDef.type === 'checkbox' && 'options' in fieldDef && Array.isArray(fieldDef.options)) {
    return 'array'
  }
  return 'string'
}

function normalizeFieldOptions(fieldDef: FieldDef): ContextFieldOption[] | undefined {
  if (!('options' in fieldDef) || !Array.isArray(fieldDef.options)) return undefined
  return fieldDef.options.map((opt) =>
    typeof opt === 'string' ? { value: opt, label: opt } : { value: opt.value, label: opt.label }
  )
}

function extractContainerChildren(
  fieldDef: FieldDef,
  fullKey: string,
  ctx: FieldContext
): AvailableField[] {
  if (fieldDef.type === 'field-group' && 'fields' in fieldDef && fieldDef.fields) {
    return extractFormFields(fieldDef.fields, fullKey, ctx)
  }
  if (fieldDef.type === 'tabs' && 'tabs' in fieldDef) {
    return fieldDef.tabs.flatMap((tab) =>
      extractFormFields(tab.fields, `${fullKey}.${tab.value}`, ctx)
    )
  }
  return []
}

/**
 * Recursively extract fields from form definition
 * Flattens nested field-groups and tabs with dot-notation paths
 */
function extractFormFields(
  fields: Record<string, FieldDef>,
  prefix: string = '',
  ctx: FieldContext
): AvailableField[] {
  const result: AvailableField[] = []

  for (const [key, fieldDef] of Object.entries(fields)) {
    const fullKey = prefix ? `${prefix}.${key}` : key

    if (CONTAINER_TYPES.has(fieldDef.type)) {
      result.push(...extractContainerChildren(fieldDef, fullKey, ctx))
      continue
    }

    result.push({
      key: fullKey,
      label: resolveText(fieldDef.label, ctx) || key,
      type: mapFieldTypeToConditionType(fieldDef),
      options: normalizeFieldOptions(fieldDef),
      group: 'Form Fields'
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
export function useAvailableFields(formFields?: Record<string, FieldDef>) {
  // Get context schema from FormRenderer via useFormBuilderContext
  const { contextSchema, fieldContext } = useFormBuilderContext()

  const availableFields = computed<AvailableField[]>(() => {
    const fields: AvailableField[] = []

    // Extract form fields if provided
    if (formFields) {
      fields.push(...extractFormFields(formFields, '', fieldContext.value))
    }

    // Extract external context fields
    fields.push(...contextSchemaToFields(contextSchema.value, 'External Context'))

    return fields
  })

  return {
    availableFields
  }
}
