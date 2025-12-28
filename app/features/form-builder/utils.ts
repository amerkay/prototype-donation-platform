import type { FieldMeta } from './types'

/**
 * Returns the default value for a field based on its type.
 * This ensures consistency across form initialization, validation preprocessing,
 * and array item creation.
 */
export function getFieldDefaultValue(fieldMeta: FieldMeta): unknown {
  // Priority 1: Use custom defaultValue if provided
  if ('defaultValue' in fieldMeta && fieldMeta.defaultValue !== undefined) {
    return fieldMeta.defaultValue
  }

  // Priority 2: Fall back to type-based defaults
  switch (fieldMeta.type) {
    case 'field-group': {
      const groupDefaults: Record<string, unknown> = {}
      if ('fields' in fieldMeta && fieldMeta.fields) {
        for (const [key, nestedField] of Object.entries(fieldMeta.fields)) {
          groupDefaults[key] = getFieldDefaultValue(nestedField)
        }
      }
      return groupDefaults
    }

    case 'array':
      return []

    case 'toggle':
      return false

    case 'number':
    case 'currency':
    case 'slider':
      return undefined

    case 'text':
    case 'textarea':
    case 'autocomplete':
    case 'select':
    case 'emoji':
    default:
      return ''
  }
}

/**
 * Checks if a field type should use string preprocessing for validation
 */
export function isTextLikeField(type: string): boolean {
  return ['text', 'textarea', 'autocomplete', 'select', 'emoji'].includes(type)
}

/**
 * Checks if a field type should use boolean preprocessing for validation
 */
export function isBooleanField(type: string): boolean {
  return type === 'toggle'
}

/**
 * Extract default values from a FormDef's field definitions
 * Recursively traverses field-groups and returns an object with default values
 *
 * @param fields - FieldMetaMap from a FormDef
 * @returns Object with default values for each field
 */
export function extractDefaultValues(fields: Record<string, FieldMeta>): Record<string, unknown> {
  const defaults: Record<string, unknown> = {}

  for (const [key, fieldMeta] of Object.entries(fields)) {
    const defaultValue = getFieldDefaultValue(fieldMeta)

    // Only include non-empty defaults (skip empty strings, undefined, empty objects)
    if (
      defaultValue !== undefined &&
      defaultValue !== '' &&
      !(typeof defaultValue === 'object' && Object.keys(defaultValue as object).length === 0)
    ) {
      defaults[key] = defaultValue
    }
  }

  return defaults
}
