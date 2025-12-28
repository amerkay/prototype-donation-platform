import type { FieldMeta } from './types'

/**
 * Extract default values from field metadata
 * Only extracts explicitly defined defaultValue properties from field definitions
 * Recursively traverses field-groups and arrays
 *
 * @param fields - FieldMetaMap from a FormDef
 * @returns Object with default values for each field that has defaultValue defined
 *
 * @example
 * ```ts
 * const fields = {
 *   name: { type: 'text', defaultValue: '', rules: z.string().min(1) },
 *   age: { type: 'number', defaultValue: 18, rules: z.number() },
 *   optional: { type: 'text', rules: z.string().optional() } // No default
 * }
 *
 * extractDefaultValues(fields) // { name: '', age: 18 }
 * ```
 */
export function extractDefaultValues(fields: Record<string, FieldMeta>): Record<string, unknown> {
  const defaults: Record<string, unknown> = {}

  for (const [key, fieldMeta] of Object.entries(fields)) {
    // Container fields: recursively extract from children
    if (fieldMeta.type === 'field-group' && 'fields' in fieldMeta && fieldMeta.fields) {
      // Always include field-groups to maintain nested structure
      defaults[key] = extractDefaultValues(fieldMeta.fields)
      continue
    }

    if (fieldMeta.type === 'tabs' && 'tabs' in fieldMeta) {
      const tabsDefaults: Record<string, unknown> = {}
      for (const tab of fieldMeta.tabs) {
        // Always include tabs to maintain structure
        tabsDefaults[tab.value] = extractDefaultValues(tab.fields)
      }
      defaults[key] = tabsDefaults
      continue
    }

    if (fieldMeta.type === 'array') {
      defaults[key] = []
      continue
    }

    // Leaf fields: use explicit defaultValue
    if ('defaultValue' in fieldMeta && fieldMeta.defaultValue !== undefined) {
      defaults[key] = fieldMeta.defaultValue
    }
  }

  return defaults
}
