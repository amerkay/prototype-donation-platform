/**
 * Validation helpers for custom fields configuration
 * Centralizes validation logic for conditions and field references
 */
import * as z from 'zod'
import type { AvailableField } from '~/features/form-builder/composables/useAvailableFields'
import type { ContextSchema } from '~/features/form-builder/conditions'

/**
 * Validates condition field references after array reorder
 * Directly checks references against available fields and injects errors
 *
 * @param items - The current list of custom fields in the array
 * @param contextSchema - External context schema (optional)
 * @param arrayPath - The vee-validate path to the array field
 * @param setters - Object containing setFieldError and setFieldTouched functions
 */
export function validateCustomFieldConditions(
  items: Record<string, unknown>[],
  contextSchema: ContextSchema | undefined,
  arrayPath: string,
  setters: {
    setFieldError: (field: string, message: string | string[] | undefined) => void
    setFieldTouched: (field: string, isTouched?: boolean) => void
  }
) {
  const { setFieldError, setFieldTouched } = setters

  items.forEach((field, index) => {
    // Only check if conditions are enabled and present
    const hasConditions =
      field.enableVisibilityConditions === true &&
      field.visibilityConditions &&
      typeof field.visibilityConditions === 'object'

    if (!hasConditions) return

    const visibilityConditions = field.visibilityConditions as Record<string, unknown>
    const visibleWhen = visibilityConditions.visibleWhen as Record<string, unknown> | undefined
    if (!visibleWhen) return

    const conditions = visibleWhen.conditions as Array<Record<string, unknown>> | undefined
    if (!conditions || !Array.isArray(conditions)) return

    // Build available field IDs: preceding custom fields + external context
    const availableFieldIds = new Set<string>()

    // Add preceding custom fields (only those before current index)
    for (let i = 0; i < index; i++) {
      const precedingItem = items[i]
      const precedingId = precedingItem?.id as string | undefined
      if (precedingId) availableFieldIds.add(precedingId)
    }

    // Add external context fields (always available)
    if (contextSchema) {
      Object.keys(contextSchema).forEach((key) => availableFieldIds.add(key))
    }

    // Validate each condition's field reference
    conditions.forEach((condition, conditionIndex) => {
      const fieldRef = condition.field as string | undefined

      // Construct path to the specific condition field
      // Format: customFields.fields[index].visibilityConditions.visibleWhen.conditions[cIndex].field
      const fieldPath = `${arrayPath}[${index}].visibilityConditions.visibleWhen.conditions[${conditionIndex}].field`

      setFieldTouched(fieldPath, true)

      if (!fieldRef) {
        setFieldError(fieldPath, 'Field is required')
      } else if (!availableFieldIds.has(fieldRef)) {
        setFieldError(
          fieldPath,
          'This field is no longer available. It may have been moved below this field, renamed, or removed.'
        )
      } else {
        // Clear error if valid
        setFieldError(fieldPath, undefined)
      }
    })
  })
}

/**
 * Create a Zod schema that validates a field reference exists in available fields
 * Returns refined string schema with contextual error message
 *
 * @param availableFields - List of fields that can be referenced
 * @param fieldName - Name of the field being validated (for error messages)
 * @returns Zod schema that validates field existence
 *
 * @example
 * ```ts
 * const schema = createFieldReferenceSchema(allAvailableFields, 'field')
 * schema.parse('field_a') // OK if field_a exists
 * schema.parse('invalid') // Error: "This field is no longer available..."
 * ```
 */
export function createFieldReferenceSchema(
  availableFields: AvailableField[],
  fieldName: string = 'field'
): z.ZodEffects<z.ZodString> {
  const availableFieldIds = new Set(availableFields.map((f) => f.key))

  return z
    .string()
    .min(1, `${fieldName.charAt(0).toUpperCase() + fieldName.slice(1)} is required`)
    .refine(
      (value) => {
        // Empty string already caught by .min(1)
        if (!value) return true

        // Check if the selected field exists in available fields
        return availableFieldIds.has(value)
      },
      {
        message:
          'This field is no longer available. It may have been moved below this field, renamed, or removed.'
      }
    )
}
