import { computed, type ComputedRef, type MaybeRefOrGetter, toValue } from 'vue'
import { useChildFieldErrors } from './useChildFieldErrors'
import { validateFields, resolveFieldRules, validateWithZod } from '../utils/validation'
import type { FieldDef, FieldContext } from '~/features/_library/form-builder/types'
import type { z } from 'zod'

/**
 * Lightweight composable to combine schema validation + live vee-validate errors
 * Used by container fields (groups, tabs) to detect errors in collapsed/unmounted children
 *
 * @param fullPath - Full vee-validate path to container
 * @param fields - Field definitions for schema validation
 * @param scopedFormValues - Current form context with values
 * @param containerRules - Optional container-level validation rules
 * @returns Computed boolean indicating if any child has errors OR container has errors
 */
export function useCombinedErrors(
  fullPath: MaybeRefOrGetter<string>,
  fields: Record<string, FieldDef>,
  scopedFormValues: ComputedRef<FieldContext>,
  containerRules?:
    | z.ZodTypeAny
    | ComputedRef<z.ZodTypeAny>
    | ((ctx: FieldContext) => z.ZodTypeAny)
    | undefined
): ComputedRef<boolean> {
  // Get live vee-validate errors for mounted fields
  const { hasChildErrors: liveErrors } = useChildFieldErrors(fullPath)

  // Compute schema validation errors for unmounted fields
  const schemaErrors = computed(() => {
    const containerValues = (scopedFormValues.value.values as Record<string, unknown>) || {}
    const resolvedPath = toValue(fullPath)
    const errors = validateFields(fields, containerValues, resolvedPath, scopedFormValues.value)

    // Also validate container-level rules if provided
    if (containerRules) {
      const rules = resolveFieldRules(containerRules, scopedFormValues.value)
      if (rules) {
        const message = validateWithZod(rules, containerValues)
        if (message) {
          errors.set(resolvedPath, message)
        }
      }
    }

    return errors.size > 0
  })

  // Combine both error sources
  return computed(() => liveErrors.value || schemaErrors.value)
}
