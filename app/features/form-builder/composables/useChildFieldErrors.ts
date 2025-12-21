import { computed, unref, type ComputedRef, type MaybeRefOrGetter } from 'vue'
import { useFormErrors } from 'vee-validate'

/**
 * Composable to detect if any child fields within a container (group/array/tabs) have validation errors
 *
 * Uses vee-validate's useFormErrors() directly for guaranteed reactivity.
 * Must be called in a component that is a child of a form component where useForm was called.
 * Trusts vee-validate to manage error lifecycle - no manual path validation needed.
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
  // Use vee-validate's useFormErrors() directly for proper reactivity
  const formErrors = useFormErrors<Record<string, string | undefined>>()

  const hasChildErrors = computed(() => {
    // Resolve the container path first (handles ref, computed, or plain string)
    const resolvedPath = unref(containerPath)

    // Access errors.value to establish reactive dependency
    const errorsObj = formErrors.value

    // Check for any error keys that are children of this container
    const containerPrefix = `${resolvedPath}.`

    // Check if any child field has an error
    // vee-validate automatically cleans up errors when fields are fixed,
    // so we trust the errors object as the source of truth
    const result = Object.entries(errorsObj).some(([errorKey, errorValue]) => {
      const hasError = errorValue && errorValue.length > 0
      const isChild = errorKey.startsWith(containerPrefix)
      // Must have an error value AND be a child of this container
      return hasError && isChild
    })

    return result
  })

  return {
    hasChildErrors
  }
}
