import type { FormDef, FieldMetaMap } from '~/features/form-builder/types'
import type { ConditionGroup } from '~/features/form-builder/conditions'
import type { CustomFieldDefinition } from './types'
import { FIELD_FACTORIES } from './fields'

/**
 * Convert custom field definition to form-builder FieldMeta (V3 - Factory-Based)
 * Maps admin config structure to runtime form field structure using field factories
 */
function customFieldToFieldMeta(field: CustomFieldDefinition): FieldMetaMap {
  const { type, id } = field

  // Get the factory for this field type
  const factory = FIELD_FACTORIES[type]
  if (!factory) {
    console.warn(`Unknown field type: ${type}`)
    return {}
  }

  // Use factory to convert config to runtime FieldMeta
  // Factory handles all type-specific logic
  const fieldMeta = factory.toFieldMeta(field as never) // Type assertion safe: discriminated union

  // Extract visibility condition from admin config if present AND enabled
  const fieldRecord = field as unknown as Record<string, unknown>
  const enableVisibilityConditions = fieldRecord.enableVisibilityConditions as boolean | undefined
  const visibilityConditions = fieldRecord.visibilityConditions as
    | Record<string, unknown>
    | undefined

  if (enableVisibilityConditions && visibilityConditions) {
    const visibleWhen = visibilityConditions.visibleWhen as ConditionGroup | undefined
    if (visibleWhen && typeof visibleWhen === 'object' && 'conditions' in visibleWhen) {
      fieldMeta.visibleWhen = visibleWhen
    }
  }

  return {
    [id]: fieldMeta
  }
}

/**
 * Convert array of custom field definitions to a FormDef section
 * Used to dynamically generate form fields
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
 * Extract default values from custom field definitions (V3 - Factory-Based)
 * Returns an object with field IDs as keys and default values
 *
 * @param customFields - Array of custom field definitions from admin config
 * @returns Object with default values for each field
 */
export function extractCustomFieldDefaults(
  customFields: CustomFieldDefinition[]
): Record<string, unknown> {
  const defaults: Record<string, unknown> = {}

  for (const field of customFields) {
    const factory = FIELD_FACTORIES[field.type]
    if (factory) {
      defaults[field.id] = factory.getDefaultValue(field as never) // Type assertion safe: discriminated union
    }
  }

  return defaults
}
