import type { FieldMeta } from './types'

/**
 * Returns the default value for a field based on its type.
 * This ensures consistency across form initialization, validation preprocessing,
 * and array item creation.
 */
export function getFieldDefaultValue(fieldMeta: FieldMeta): unknown {
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
