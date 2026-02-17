import { computed, ref, watch, type ComputedRef, type MaybeRefOrGetter, toValue } from 'vue'
import { useFormValues } from 'vee-validate'
import type { FieldContext } from '~/features/_library/form-builder/types'
import type { z } from 'zod'
import {
  resolveFieldRules,
  validateWithZod
} from '~/features/_library/form-builder/utils/validation'

/**
 * Composable for validating container fields (field-group, tabs) with rules
 *
 * Validates container-level rules using plain Zod (not vee-validate's useField).
 * This keeps container errors out of vee-validate's error map, which is critical:
 * FormRenderer's updateOnlyWhenValid gate filters errors.value — if container errors
 * appeared there, they'd block model emission, preventing store dirty tracking.
 * Container errors are still caught by validateFields() for isValid/schemaErrors.
 *
 * @param containerPath - Full vee-validate path to the container (e.g., "impactBoost.upsells")
 * @param rules - Zod schema for validating the container's child values
 * @param scopedFormValues - Current form context with values
 * @param parentVisible - Function to check if parent container is visible
 * @returns Object with container validation errors
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
  if (!rules) {
    return {
      containerErrors: computed(() => [])
    }
  }

  const veeFormValues = useFormValues<Record<string, unknown>>()
  const currentErrors = ref<string[]>([])

  // Compute container value from child fields by reading vee-validate form values
  const containerValue = computed(() => {
    const path = toValue(containerPath)
    const pathParts = path.split('.')

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

  // Serialize to avoid redundant validations on same data
  const serializedValue = computed(() => {
    try {
      return JSON.stringify(containerValue.value)
    } catch {
      return String(containerValue.value)
    }
  })

  // Watch and validate with plain Zod — errors stay local, not in vee-validate
  watch(
    serializedValue,
    () => {
      if (!parentVisible()) {
        currentErrors.value = []
        return
      }

      const resolved = resolveFieldRules(rules, scopedFormValues.value)
      if (!resolved) {
        currentErrors.value = []
        return
      }

      const message = validateWithZod(resolved, containerValue.value)
      currentErrors.value = message ? [message] : []
    },
    { flush: 'post', immediate: true }
  )

  return {
    containerErrors: computed(() => currentErrors.value)
  }
}
