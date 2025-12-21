import { computed, inject, unref, type ComputedRef, type MaybeRefOrGetter } from 'vue'
import { pathExistsInValues } from '~/features/form-builder/field-path-utils'

/**
 * Composable to detect if any child fields within a container (group/array/tabs) have validation errors
 *
 * @param containerPath - The full path to the container field (can be string, ref, or computed)
 * @param containerValues - Optional values to validate paths against (can be plain value, ref, or computed)
 * @returns Object with hasChildErrors computed boolean
 *
 * @example
 * ```ts
 * // For field groups/tabs (with computed path)
 * const fullPath = computed(() => `${sectionId}.${groupPath.value}`)
 * const { hasChildErrors } = useChildFieldErrors(fullPath)
 *
 * // For arrays (validate against array items)
 * const { hasChildErrors } = useChildFieldErrors(props.name, props.field.value)
 * ```
 */
export function useChildFieldErrors(
  containerPath: MaybeRefOrGetter<string>,
  containerValues?: MaybeRefOrGetter<unknown>
): { hasChildErrors: ComputedRef<boolean> } {
  // Inject form errors from FormRenderer
  const formErrors = inject<ComputedRef<Record<string, string | undefined>>>(
    'formErrors',
    computed(() => ({}))
  )

  // Inject form values for path validation (only needed if containerValues not provided)
  const getFormValues = inject<() => Record<string, unknown>>('formValues', () => ({}))

  const hasChildErrors = computed(() => {
    // Access the injected computed ref's value to establish reactive dependency
    const errorsObj = unref(formErrors)
    const keys = Object.keys(errorsObj)

    // Early return if no errors exist
    if (keys.length === 0) return false

    // Resolve the container path (handles ref, computed, or plain string)
    const resolvedPath = unref(containerPath)

    // Check for any error keys that are children of this container
    const containerPrefix = `${resolvedPath}.`

    return keys.some((errorKey) => {
      // Skip if no error value or not a child of this container
      if (!errorsObj[errorKey] || !errorKey.startsWith(containerPrefix)) {
        return false
      }

      // Extract relative path from container (e.g., '0.name' from 'donorInfo.phoneNumbers.0.name')
      const relativePath = errorKey.slice(containerPrefix.length)

      // Validate that the error path exists in current values
      // This filters out orphaned errors from deleted array items or hidden fields
      const valuesToValidate = containerValues ? unref(containerValues) : getFormValues()
      return pathExistsInValues(relativePath, valuesToValidate)
    })
  })

  return {
    hasChildErrors
  }
}
