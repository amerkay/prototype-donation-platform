import { inject, computed, type ComputedRef } from 'vue'
import { useFormValues } from 'vee-validate'

type FormValues = Record<string, unknown>

/**
 * Composable to access form builder context and values using vee-validate's composition API
 * Automatically unwraps section-prefixed values and handles scoped container overrides
 *
 * @returns Object with all context values and unwrapped form values
 *
 * @example
 * ```ts
 * const { sectionId, fieldPrefix, formValues, parentGroupVisible } = useFormBuilderContext()
 * ```
 */
export function useFormBuilderContext() {
  const sectionId = inject<string>('sectionId', '')
  const fieldPrefix = inject<string>('fieldPrefix', '')
  const parentGroupVisible = inject<() => boolean>('parentGroupVisible', () => true)

  // Get form values from vee-validate
  const veeFormValues = useFormValues<Record<string, FormValues>>()

  // Check if we have scoped values from a container (field-group/tabs)
  // Containers can optionally provide scoped values that merge group/tab data
  const scopedFormValues = inject<ComputedRef<FormValues> | null>('scopedFormValues', null)

  // Unwrap section-prefixed values or use scoped override
  const formValues = computed(() => {
    // Prefer scoped values if provided (from field-group/tabs)
    if (scopedFormValues) {
      return scopedFormValues.value
    }

    // Otherwise unwrap from section ID
    const sectionValues = veeFormValues.value[sectionId]
    return (sectionValues as FormValues) || {}
  })

  return {
    sectionId,
    fieldPrefix,
    formValues,
    parentGroupVisible
  }
}
