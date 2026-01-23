import type { CustomFieldType } from '~/features/_library/custom-fields/fields'
import type { AvailableField } from '~/features/_library/form-builder/composables/useAvailableFields'
import { slugify } from '~/features/_library/custom-fields/fields/field-base'

/**
 * Extract field metadata from a list of custom field configuration items
 * Used to convert saved custom field definitions into AvailableFields for condition builder
 *
 * @param items - List of custom field configuration objects
 * @param limitIndex - Optional limit to only include fields up to this index
 * @returns Array of AvailableField objects compatible with condition builder
 */
export function extractAvailableFields(
  items: Record<string, unknown>[],
  limitIndex?: number
): AvailableField[] {
  const fields: AvailableField[] = []
  const max = limitIndex !== undefined ? limitIndex : items.length

  for (let i = 0; i < max; i++) {
    const item = items[i]
    if (!item) continue

    const fieldType = item.type as CustomFieldType | undefined
    const fieldId = item.id as string | undefined
    const fieldLabel = item.label as string | undefined

    // Only include fields that have been properly configured
    if (!fieldType || !fieldId || !fieldLabel) continue

    // Map custom field types to form builder types
    let type: 'string' | 'number' | 'boolean' | 'array' = 'string'
    let options: Array<{ value: string | number; label: string }> | undefined = undefined

    if (fieldType === 'number' || fieldType === 'slider') {
      type = 'number'
    } else if (fieldType === 'checkbox' && !item.options) {
      type = 'boolean'
    } else if (
      (fieldType === 'select' || fieldType === 'radio-group' || fieldType === 'checkbox') &&
      item.options
    ) {
      // Select/radio/checkbox with options are choice fields - use 'array' type for in/notIn operators
      type = 'array'
      const opts = item.options as string[] | Array<{ value: string; label: string }>
      if (Array.isArray(opts) && opts.length > 0) {
        if (typeof opts[0] === 'string') {
          // Slugify values to match runtime field behavior (select/radio/checkbox factories auto-slugify)
          options = (opts as string[]).map((opt) => ({
            value: slugify(opt),
            label: opt
          }))
        } else {
          options = opts as Array<{ value: string; label: string }>
        }
      }
    }

    fields.push({
      key: fieldId,
      label: fieldLabel,
      type,
      group: 'Form Fields',
      options
    })
  }

  return fields
}
