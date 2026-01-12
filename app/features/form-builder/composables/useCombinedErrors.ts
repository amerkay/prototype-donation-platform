import { computed, type ComputedRef, type MaybeRefOrGetter, toValue } from 'vue'
import { useChildFieldErrors } from './useChildFieldErrors'
import { validateFields } from '../utils/validation'
import type { FieldDef, FieldContext } from '~/features/form-builder/types'

/**
 * Lightweight composable to combine schema validation + live vee-validate errors
 * Used by container fields (groups, tabs) to detect errors in collapsed/unmounted children
 *
 * @param fullPath - Full vee-validate path to container
 * @param fields - Field definitions for schema validation
 * @param scopedFormValues - Current form context with values
 * @returns Computed boolean indicating if any child has errors
 */
export function useCombinedErrors(
  fullPath: MaybeRefOrGetter<string>,
  fields: Record<string, FieldDef>,
  scopedFormValues: ComputedRef<FieldContext>
): ComputedRef<boolean> {
  // Get live vee-validate errors for mounted fields
  const { hasChildErrors: liveErrors } = useChildFieldErrors(fullPath)

  // Compute schema validation errors for unmounted fields
  const schemaErrors = computed(() => {
    const containerValues = (scopedFormValues.value.values as Record<string, unknown>) || {}
    const resolvedPath = toValue(fullPath)
    const errors = validateFields(fields, containerValues, resolvedPath, scopedFormValues.value)
    return errors.size > 0
  })

  // Combine both error sources
  return computed(() => liveErrors.value || schemaErrors.value)
}
