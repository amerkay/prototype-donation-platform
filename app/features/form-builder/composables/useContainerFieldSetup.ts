import { computed, provide } from 'vue'
import { getRecordAtPath, useFieldPath, checkFieldVisibility } from './useFieldPath'
import { useFormBuilderContext } from './useFormBuilderContext'
import { useChildFieldErrors } from './useChildFieldErrors'

type FormValues = Record<string, unknown>

/**
 * Composable to handle all shared setup logic for container fields (field-group, tabs)
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
  // Special case: if we're inside an array item (path contains [N]), use the item values directly
  const scopedFormValues = computed(() => {
    // Convert bracket notation to dot notation for getRecordAtPath
    // e.g., "messages[0]" -> "messages.0"
    const normalizedPath = relativePath.value.replace(/\[(\d+)\]/g, '.$1')
    const containerValue = getRecordAtPath(formValues.value, normalizedPath)

    // If we're inside an array item (detected by array index in path like "messages[0]")
    // Use the item's values as the base for resolving dynamic text (labels, descriptions)
    // This allows label functions in array itemFields to access item properties directly
    if (relativePath.value.includes('[') && containerValue) {
      return containerValue
    }

    // For regular containers, merge container values with root form values
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
