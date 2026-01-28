import { computed, watch, type ComputedRef, type MaybeRefOrGetter, toValue } from 'vue'
import { useField, useFormValues } from 'vee-validate'
import { toTypedSchema } from '@vee-validate/zod'
import type { FieldContext } from '~/features/_library/form-builder/types'
import type { z } from 'zod'

/**
 * Composable for validating container fields (field-group, tabs) with rules
 *
 * Container fields don't have their own value - their value is the object containing
 * all child field values. This composable:
 * 1. Checks if the container has validation rules
 * 2. If yes, registers with vee-validate using the child values as the container value
 * 3. Returns validation errors for display
 *
 * @param containerPath - Full vee-validate path to the container (e.g., "impactBoost.upsells")
 * @param rules - Zod schema for validating the container's child values
 * @param scopedFormValues - Current form context with values
 * @param parentVisible - Function to check if parent container is visible
 * @returns Object with container validation errors
 *
 * @example
 * ```ts
 * const { containerErrors } = useContainerValidation(
 *   fullPath,
 *   props.meta.rules,
 *   scopedFormValues,
 *   () => true
 * )
 * ```
 */
export function useContainerValidation(
  containerPath: MaybeRefOrGetter<string>,
  rules:
    | z.ZodTypeAny
    | ComputedRef<z.ZodTypeAny>
    | ((ctx: FieldContext) => z.ZodTypeAny)
    | undefined,
  scopedFormValues: ComputedRef<FieldContext>,
  parentVisible: () => boolean
): {
  containerErrors: ComputedRef<string[]>
} {
  // If no rules, skip validation entirely
  if (!rules) {
    return {
      containerErrors: computed(() => [])
    }
  }

  // Get full form values from vee-validate to compute container value
  const veeFormValues = useFormValues<Record<string, unknown>>()

  // Resolve rules (handle function/computed/direct schema)
  const resolvedRules = computed(() => {
    if (!rules) return undefined

    const resolved =
      typeof rules === 'function'
        ? rules(scopedFormValues.value)
        : 'value' in rules
          ? rules.value
          : rules

    return toTypedSchema(resolved)
  })

  // Compute container value from child fields by reading vee-validate form values
  // The container's value is the object at containerPath containing all child values
  const containerValue = computed(() => {
    const path = toValue(containerPath)
    const pathParts = path.split('.')

    // Navigate to the container's value in form values
    let value: unknown = veeFormValues.value
    for (const part of pathParts) {
      if (value && typeof value === 'object' && part in value) {
        value = (value as Record<string, unknown>)[part]
      } else {
        return undefined
      }
    }

    return value
  })

  // Register container with vee-validate for validation
  // Keep value on unmount to preserve validation state when container is collapsed
  const { errors, validate, resetField } = useField(() => toValue(containerPath), resolvedRules, {
    validateOnValueUpdate: false, // We'll trigger validation manually
    syncVModel: false,
    keepValueOnUnmount: true
  })

  // Watch container value and trigger validation
  // Use immediate: true to validate on mount/remount (when component remounts after parent collapse)
  // Use flush: 'post' to ensure child field updates have settled
  watch(
    containerValue,
    () => {
      // Only validate if parent container is visible
      if (parentVisible()) {
        validate()
      } else {
        // Clear errors when parent becomes invisible to avoid stale error badges
        resetField()
      }
    },
    { deep: true, flush: 'post', immediate: true }
  )

  // Return container errors as array
  const containerErrors = computed(() => {
    if (!errors.value || errors.value.length === 0) return []
    return Array.isArray(errors.value) ? errors.value : [errors.value]
  })

  return {
    containerErrors
  }
}
