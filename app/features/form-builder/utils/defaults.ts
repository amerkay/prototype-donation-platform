import type { FieldMeta } from '../types'

/**
 * Extract default values from field metadata
 * Only extracts explicitly defined defaultValue properties from field definitions
 * Recursively traverses field-groups and arrays
 *
 * Supports conditional extraction: field-groups with `extractDefaultsWhen: false`
 * will not have their children's defaults extracted. This enables type-scoped configs
 * where only the active type's defaults are included.
 *
 * @param fields - FieldMetaMap from a FormDef
 * @param options - Extraction options
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
export function extractDefaultValues(
  fields: Record<string, FieldMeta>,
  options: { skipConditionalGroups?: boolean } = {}
): Record<string, unknown> {
  const { skipConditionalGroups = true } = options
  const defaults: Record<string, unknown> = {}

  for (const [key, fieldMeta] of Object.entries(fields)) {
    // Container fields: recursively extract from children
    if (fieldMeta.type === 'field-group' && 'fields' in fieldMeta && fieldMeta.fields) {
      // Skip conditional groups if configured (prevents extracting defaults from inactive type-specific configs)
      if (skipConditionalGroups && 'extractDefaultsWhen' in fieldMeta) {
        const extractDefaults = fieldMeta.extractDefaultsWhen
        if (extractDefaults === false) {
          // Skip this group's defaults - it's a conditional config group
          continue
        }
      }

      // Always include field-groups to maintain nested structure
      defaults[key] = extractDefaultValues(fieldMeta.fields, options)
      continue
    }

    if (fieldMeta.type === 'tabs' && 'tabs' in fieldMeta) {
      const tabsDefaults: Record<string, unknown> = {}
      for (const tab of fieldMeta.tabs) {
        // Always include tabs to maintain structure
        tabsDefaults[tab.value] = extractDefaultValues(tab.fields, options)
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
