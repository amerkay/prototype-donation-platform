import { computed, provide } from 'vue'
import { getRecordAtPath, useFieldPath, checkFieldVisibility } from './useFieldPath'
import { useFormBuilderContext } from './useFormBuilderContext'
import { useChildFieldErrors } from './useChildFieldErrors'

type FormValues = Record<string, unknown>

/**
 * Composable to handle all shared setup logic for container fields (field-group, tabs)
 * Eliminates 40+ lines of duplication between FormFieldGroup and FormFieldTabs
 *
 * Responsibilities:
 * - Compute and provide field paths with proper nesting
 * - Manage visibility based on parent + own conditions
 * - Provide scoped form values to children (merging container data into root)
 * - Track child field validation errors
 * - Update parent visibility context
 *
 * @param name - Container field name
 * @param visibleWhen - Optional visibility condition function
 * @returns Object with computed paths, visibility, error state, and resolved metadata
 *
 * @example
 * ```ts
 * const { isVisible, hasChildErrors } = useContainerFieldSetup(
 *   props.name,
 *   props.meta.visibleWhen
 * )
 * ```
 */
export function useContainerFieldSetup(
  name: string,
  visibleWhen?: (values: FormValues) => boolean
) {
  const {
    sectionId,
    fieldPrefix: parentFieldPrefix,
    formValues,
    parentGroupVisible
  } = useFormBuilderContext()

  // Compute paths for this container field
  const { relativePath, currentFieldPrefix, fullPath } = useFieldPath({
    name,
    sectionId,
    parentFieldPrefix
  })

  // Compute visibility for this container
  const isVisible = computed(() => {
    return checkFieldVisibility({ visibleWhen }, formValues.value, {
      parentVisible: parentGroupVisible()
    })
  })

  // Update parent visibility context for children
  provide('parentGroupVisible', () => isVisible.value)

  // Provide the cumulative prefix to child fields
  provide('fieldPrefix', currentFieldPrefix.value)

  // Provide scoped form values to child fields
  // Merges container-specific values into the root form values for child access
  const scopedFormValues = computed(() => {
    const containerValue = getRecordAtPath(formValues.value, relativePath.value)
    return { ...formValues.value, ...(containerValue || {}) }
  })
  provide('scopedFormValues', scopedFormValues)

  // Check if any child fields have validation errors
  const { hasChildErrors } = useChildFieldErrors(fullPath)

  return {
    relativePath,
    currentFieldPrefix,
    fullPath,
    isVisible,
    hasChildErrors,
    scopedFormValues,
    formValues
  }
}
