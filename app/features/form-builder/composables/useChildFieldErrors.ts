import { computed, unref, type ComputedRef, type MaybeRefOrGetter } from 'vue'
import { useFormErrors } from 'vee-validate'

/**
 * Composable to detect if any child fields within a container (group/array/tabs) have validation errors
 *
 * Uses vee-validate's useFormErrors() helper for guaranteed reactivity.
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
  // Use vee-validate's official helper for reactive error tracking
  const formErrors = useFormErrors()

  const hasChildErrors = computed(() => {
    // Access errors.value to establish reactive dependency
    const errorsObj = formErrors.value

    // Resolve the container path (handles ref, computed, or plain string)
    const resolvedPath = unref(containerPath)

    // Check for any error keys that are children of this container
    const containerPrefix = `${resolvedPath}.`

    // Check if any child field has an error
    // vee-validate automatically cleans up errors when fields are fixed,
    // so we trust the errors object as the source of truth
    return Object.keys(errorsObj).some((errorKey) => {
      // Has error value and is a child of this container
      return errorsObj[errorKey] && errorKey.startsWith(containerPrefix)
    })
  })

  return {
    hasChildErrors
  }
}
