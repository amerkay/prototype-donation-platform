import { computed, unref, type ComputedRef, type MaybeRefOrGetter } from 'vue'
import { useFormErrors, useFormValues } from 'vee-validate'
import { pathExistsInValues } from '~/features/form-builder/field-path-utils'

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
  // Use vee-validate's useFormErrors() and useFormValues() directly for proper reactivity
  const formErrors = useFormErrors<Record<string, string | undefined>>()
  const formValues = useFormValues()

  // Computed filtered errors (only valid child errors)
  const filteredErrors = computed(() => {
    const resolvedPath = unref(containerPath)
    const errorsObj = formErrors.value
    const values = formValues.value

    // Match both dot notation children (.field) and bracket notation children ([index])
    const dotPrefix = `${resolvedPath}.`
    const bracketPrefix = `${resolvedPath}[`

    const filtered: Record<string, string | undefined> = {}

    for (const [errorKey, errorValue] of Object.entries(errorsObj)) {
      const hasError = errorValue && errorValue.length > 0
      // Check if error is a child using either dot or bracket notation
      const isChild = errorKey.startsWith(dotPrefix) || errorKey.startsWith(bracketPrefix)

      if (!hasError || !isChild) continue

      // Convert bracket notation to dot notation for path validation
      const dotNotationPath = errorKey.replace(/\[(\d+)\]/g, '.$1')
      const pathExists = pathExistsInValues(dotNotationPath, values)

      if (pathExists) {
        filtered[errorKey] = errorValue
      }
    }

    return filtered
  })

  const hasChildErrors = computed(() => {
    return Object.keys(filteredErrors.value).length > 0
  })

  return {
    hasChildErrors
  }
}
