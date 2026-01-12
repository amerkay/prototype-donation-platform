import type { FieldDef } from '../types'

/**
 * Extract default values from field definitions
 * Only extracts explicitly defined defaultValue properties from field definitions
 * Recursively traverses field-groups and arrays
 *
 * Supports conditional extraction: field-groups with `extractDefaultsWhen: false`
 * will not have their children's defaults extracted. This enables type-scoped configs
 * where only the active type's defaults are included.
 *
 * @param fields - Record of FieldDef objects from a ComposableForm
 * @param options - Extraction options
 * @returns Object with default values for each field that has defaultValue defined
 *
 * @example
 * ```ts
 * const fields = {
 *   name: textField('name', { defaultValue: '', rules: z.string().min(1) }),
 *   age: numberField('age', { defaultValue: 18, rules: z.number() }),
 *   optional: textField('optional', { rules: z.string().optional() }) // No default
 * }
 *
 * extractDefaultValues(fields) // { name: '', age: 18 }
 * ```
 */
export function extractDefaultValues(
  fields: Record<string, FieldDef>,
  options: { skipConditionalGroups?: boolean } = {}
): Record<string, unknown> {
  const { skipConditionalGroups = true } = options
  const defaults: Record<string, unknown> = {}

  for (const [key, fieldDef] of Object.entries(fields)) {
    // Container fields: recursively extract from children
    if (fieldDef.type === 'field-group' && 'fields' in fieldDef && fieldDef.fields) {
      // Skip conditional groups if configured (prevents extracting defaults from inactive type-specific configs)
      if (skipConditionalGroups && 'extractDefaultsWhen' in fieldDef) {
        const extractDefaults = fieldDef.extractDefaultsWhen
        if (extractDefaults === false) {
          // Skip this group's defaults - it's a conditional config group
          continue
        }
      }

      // Always include field-groups to maintain nested structure
      defaults[key] = extractDefaultValues(fieldDef.fields, options)
      continue
    }

    if (fieldDef.type === 'tabs' && 'tabs' in fieldDef) {
      const tabsDefaults: Record<string, unknown> = {}
      for (const tab of fieldDef.tabs) {
        // Always include tabs to maintain structure
        tabsDefaults[tab.value] = extractDefaultValues(tab.fields, options)
      }
      defaults[key] = tabsDefaults
      continue
    }

    if (fieldDef.type === 'array') {
      defaults[key] = []
      continue
    }

    // Leaf fields: use explicit defaultValue
    if ('defaultValue' in fieldDef && fieldDef.defaultValue !== undefined) {
      defaults[key] = fieldDef.defaultValue
    }
  }

  return defaults
}
