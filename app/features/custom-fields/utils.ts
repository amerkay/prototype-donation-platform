import { defineForm } from '~/features/form-builder/api'
import type {
  ComposableForm,
  FieldDef,
  OnVisibilityChangeContext
} from '~/features/form-builder/types'
import type { ConditionGroup } from '~/features/form-builder/conditions'
import { evaluateConditionGroup } from '~/features/form-builder/conditions'
import type { CustomFieldDefinition } from './types'
import { FIELD_FACTORIES } from './fields'

/**
 * Convert custom field definition to composable field (V4 - Composition API)
 * Maps admin config structure to composable field definition using field factories
 */
function customFieldToComposable(field: CustomFieldDefinition): FieldDef | null {
  const { type } = field

  // Skip fields without a type (incomplete configuration)
  if (!type) {
    return null
  }

  // Get the factory for this field type
  const factory = FIELD_FACTORIES[type]
  if (!factory) {
    console.warn(`Unknown field type: ${type}`)
    throw new Error(`Unknown field type: ${type}`)
  }

  // Use factory to convert config to composable FieldDef
  // Factory handles all type-specific logic
  const fieldDef = factory.toComposable(field as never) // Type assertion safe: discriminated union

  // Extract visibility condition from admin config if present AND enabled
  const fieldRecord = field as unknown as Record<string, unknown>
  const enableVisibilityConditions = fieldRecord.enableVisibilityConditions as boolean | undefined
  const visibilityConditions = fieldRecord.visibilityConditions as
    | Record<string, unknown>
    | undefined

  if (enableVisibilityConditions && visibilityConditions) {
    const visibleWhen = visibilityConditions.visibleWhen as ConditionGroup | undefined
    if (visibleWhen && typeof visibleWhen === 'object' && 'conditions' in visibleWhen) {
      // Add visibleWhen to the field definition
      const mutableFieldDef = fieldDef as unknown as Record<string, unknown>
      mutableFieldDef.visibleWhen = visibleWhen

      // Clear field value when hidden to keep form data clean
      mutableFieldDef.onVisibilityChange = ({ visible, clearValue }: OnVisibilityChangeContext) => {
        if (!visible) {
          clearValue(field.id)
        }
      }
    }
  }

  return fieldDef
}

/**
 * Convert array of custom field definitions to a ComposableForm
 * Used to dynamically generate form fields at runtime
 *
 * @param customFields - Array of custom field definitions from admin config
 * @returns ComposableForm ready for FormRenderer
 *
 * @example
 * ```typescript
 * const customFieldsForm = useCustomFieldsForm(config.customFields.fields)
 * <FormRenderer :section="customFieldsForm" v-model="data" />
 * ```
 */
export function useCustomFieldsForm(customFields: CustomFieldDefinition[]): ComposableForm {
  return defineForm('customFields', () => {
    const fields: Record<string, FieldDef> = {}

    // Convert each custom field definition to composable FieldDef
    for (const field of customFields) {
      const fieldDef = customFieldToComposable(field)
      if (fieldDef) {
        fields[field.id] = fieldDef
      }
    }

    return fields
  })
}

/**
 * Extract default values from custom field definitions (V3 - Factory-Based)
 * Returns an object with field IDs as keys and default values
 *
 * IMPORTANT: Skips fields with visibility conditions enabled. Those fields will have their
 * defaults applied by FormField's visibility watch when they become visible.
 *
 * @param customFields - Array of custom field definitions from admin config
 * @returns Object with default values for each field (excluding conditionally visible fields)
 */
export function extractCustomFieldDefaults(
  customFields: CustomFieldDefinition[]
): Record<string, unknown> {
  const defaults: Record<string, unknown> = {}

  for (const field of customFields) {
    // Skip fields without a type (incomplete configuration)
    if (!field.type) continue

    // Skip fields with visibility conditions - let FormField handle their defaults
    // This prevents hidden fields from having values when they should be excluded
    const fieldRecord = field as unknown as Record<string, unknown>
    const enableVisibilityConditions = fieldRecord.enableVisibilityConditions as boolean | undefined
    if (enableVisibilityConditions) {
      continue
    }

    const factory = FIELD_FACTORIES[field.type]
    if (factory) {
      defaults[field.id] = factory.getDefaultValue(field as never) // Type assertion safe: discriminated union
    }
  }

  return defaults
}

/**
 * Check if custom fields have any visible fields based on external context
 * Evaluates visibility conditions for all fields and returns true if at least one field is visible
 *
 * @param customFields - Array of custom field definitions from admin config
 * @param externalContext - External context values (e.g., companyMatch, donorLevel, country)
 * @returns True if at least one field is visible, false if all fields are hidden
 *
 * @example
 * ```typescript
 * const hasVisibleFields = hasAnyVisibleCustomFields(
 *   config.customFields.fields,
 *   { companyMatch: false, donorLevel: 'bronze', country: 'US' }
 * )
 * if (!hasVisibleFields) {
 *   // Show "no fields available" message
 * }
 * ```
 */
export function hasAnyVisibleCustomFields(
  customFields: CustomFieldDefinition[],
  externalContext: Record<string, unknown> = {}
): boolean {
  if (!customFields || customFields.length === 0) {
    return false
  }

  // Track field values to support field-to-field visibility conditions
  const fieldValues: Record<string, unknown> = {}

  // Check each field in order (important for field-to-field dependencies)
  for (const field of customFields) {
    // Skip fields without a type (incomplete configuration)
    if (!field.type) continue

    const fieldRecord = field as unknown as Record<string, unknown>
    const enableVisibilityConditions = fieldRecord.enableVisibilityConditions as boolean | undefined
    const visibilityConditions = fieldRecord.visibilityConditions as
      | Record<string, unknown>
      | undefined

    // Field is visible if it has no conditions or conditions are disabled
    if (!enableVisibilityConditions || !visibilityConditions) {
      return true
    }

    // Check if field has visibleWhen conditions
    const visibleWhen = visibilityConditions.visibleWhen as ConditionGroup | undefined
    if (!visibleWhen || typeof visibleWhen !== 'object' || !('conditions' in visibleWhen)) {
      return true
    }

    // Merge external context with field values collected so far
    const contextToEvaluate = { ...externalContext, ...fieldValues }

    // Evaluate visibility conditions
    const isVisible = evaluateConditionGroup(visibleWhen, contextToEvaluate)

    if (isVisible) {
      // At least one field is visible
      return true
    }

    // Store default value for this field in case other fields reference it
    const factory = FIELD_FACTORIES[field.type]
    if (factory) {
      fieldValues[field.id] = factory.getDefaultValue(field as never)
    }
  }

  // No visible fields found
  return false
}
