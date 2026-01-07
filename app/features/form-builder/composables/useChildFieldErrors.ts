import { computed, type ComputedRef, type MaybeRefOrGetter } from 'vue'
import { useFormErrors, useFormValues } from 'vee-validate'
import { getChildErrorsMap } from '../utils/errors'

/**
 * Composable to detect if any child fields within a container (group/array/tabs) have validation errors
 *
 * Uses vee-validate's useFormErrors() and useFormValues() for guaranteed reactivity.
 * Must be called in a component that is a child of a form component where useForm was called.
 * Filters out orphaned errors from removed array items by validating paths against current form values.
 *
 * @param containerPath - The full path to the container field (can be string, ref, or computed)
 * @returns Object with hasChildErrors computed boolean
 *
 * @example
 * ```ts
 * // For field groups/tabs (with computed path)
 * const fullPath = computed(() => `${sectionId}.${groupPath.value}`)
 * const { hasChildErrors } = useChildFieldErrors(fullPath)
 *
 * // For arrays
 * const { hasChildErrors } = useChildFieldErrors(props.name)
 * ```
 */
export function useChildFieldErrors(containerPath: MaybeRefOrGetter<string>): {
  hasChildErrors: ComputedRef<boolean>
} {
  const formErrors = useFormErrors<Record<string, string | undefined>>()
  const formValues = useFormValues()

  const childErrorsMap = getChildErrorsMap(containerPath, formErrors, formValues)

  const hasChildErrors = computed(() => childErrorsMap.value.size > 0)

  return {
    hasChildErrors
  }
}
