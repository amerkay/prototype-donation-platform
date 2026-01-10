import { computed, unref, type ComputedRef, type MaybeRefOrGetter } from 'vue'
import { pathExistsInValues } from '../composables/useFieldPath'

/**
 * Get child errors for a container path as a reactive Map
 * Shared utility used by useChildFieldErrors composable
 *
 * @param containerPath - The full path to the container field
 * @param formErrors - Reactive form errors object from vee-validate
 * @param formValues - Reactive form values object from vee-validate
 * @returns Computed Map of error paths to error messages
 */
export function getChildErrorsMap(
  containerPath: MaybeRefOrGetter<string>,
  formErrors: ComputedRef<Record<string, string | undefined>>,
  formValues: ComputedRef<Record<string, unknown>>
): ComputedRef<Map<string, string>> {
  return computed(() => {
    const resolvedPath = unref(containerPath)
    const errorsObj = formErrors.value
    const values = formValues.value

    const dotPrefix = `${resolvedPath}.`
    const bracketPrefix = `${resolvedPath}[`
    const errorMap = new Map<string, string>()

    for (const [errorKey, errorValue] of Object.entries(errorsObj)) {
      const hasError = errorValue && errorValue.length > 0
      const isChild = errorKey.startsWith(dotPrefix) || errorKey.startsWith(bracketPrefix)

      if (!hasError || !isChild) continue

      // Convert bracket notation to dot notation for path validation
      const dotNotationPath = errorKey.replace(/\[(\d+)\]/g, '.$1')
      const pathExists = pathExistsInValues(dotNotationPath, values)

      if (pathExists) {
        errorMap.set(errorKey, errorValue)
      }
    }

    return errorMap
  })
}
