import {
  computed,
  nextTick,
  ref,
  toValue,
  watch,
  type ComputedRef,
  type MaybeRefOrGetter,
  type Ref
} from 'vue'
import { useFormErrors, useFormValues } from 'vee-validate'
import { getChildErrorsMap } from '../utils/errors'
import { validateFields } from '../utils/validation'
import type { FieldMeta, FieldContext } from '../types'
import { useFormActions } from './useFormActions'

interface InitialValidationOptions {
  fields?: Record<string, FieldMeta>
  scopedFormValues?: ComputedRef<FieldContext>
}

/**
 * Composable to preserve child field errors across mount/unmount cycles.
 *
 * Solves two key problems with vee-validate:
 * 1. Initial load: Invalid data in collapsed containers shows no errors (vee-validate only validates mounted fields)
 * 2. Remount: Collapsing/expanding clears errors for unmounted fields
 *
 * Strategy: Run independent Zod validation to maintain error cache, restore on mount.
 *
 * @example
 * ```ts
 * const { hasChildErrors } = useCachedChildErrors(fullPath, isOpen, {
 *   fields: props.meta.fields,
 *   scopedFormValues
 * })
 * ```
 */
export function useCachedChildErrors(
  containerPath: MaybeRefOrGetter<string>,
  isContentMounted: Ref<boolean> | ComputedRef<boolean>,
  options?: InitialValidationOptions
): {
  hasChildErrors: ComputedRef<boolean>
} {
  const formErrors = useFormErrors<Record<string, string | undefined>>()
  const formValues = useFormValues()
  const formActions = useFormActions()

  const cachedErrors = ref<Map<string, string>>(new Map())

  // Compute errors via schema validation (independent of vee-validate mount state)
  const computeSchemaErrors = (): Map<string, string> | undefined => {
    if (!options?.fields || !options?.scopedFormValues) return undefined
    const pathValue = toValue(containerPath)
    const fieldContext = options.scopedFormValues.value
    const containerValues = (fieldContext.values as Record<string, unknown>) || {}
    return validateFields(options.fields, containerValues, pathValue, fieldContext)
  }

  // Seed initial cache (handles collapsed accordions on load)
  const initialErrors = computeSchemaErrors()
  if (initialErrors?.size) cachedErrors.value = initialErrors

  // Sync cache with mount state and live errors
  watch(
    () => ({
      mounted: isContentMounted.value,
      liveErrors: getChildErrorsMap(containerPath, formErrors, formValues).value
    }),
    async ({ mounted, liveErrors }, old) => {
      // Restore cached errors when mounting
      if (mounted && !old?.mounted && cachedErrors.value.size > 0 && formActions) {
        await nextTick()
        for (const [path, message] of cachedErrors.value) {
          formActions.setFieldTouched(path, true)
          formActions.setFieldError(path, message)
        }
        return
      }

      // Update cache when unmounting or when mounted with new errors
      if (mounted) {
        // While mounted, prefer live errors. If descendants unmounted (tabs), fallback to schema
        cachedErrors.value =
          liveErrors.size > 0 ? new Map(liveErrors) : computeSchemaErrors() || cachedErrors.value
      } else if (old?.mounted) {
        // Just unmounted: preserve live errors, or fallback to schema
        cachedErrors.value =
          liveErrors.size > 0 ? new Map(liveErrors) : computeSchemaErrors() || cachedErrors.value
      }
    },
    { immediate: true }
  )

  // Check both live (for manual errors on unmounted paths) and cached errors
  const hasChildErrors = computed(() => {
    const liveErrors = getChildErrorsMap(containerPath, formErrors, formValues).value
    return liveErrors.size > 0 || cachedErrors.value.size > 0
  })

  return { hasChildErrors }
}
