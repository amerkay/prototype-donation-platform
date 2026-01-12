import { computed, provide } from 'vue'
import { getRecordAtPath, useFieldPath, checkFieldVisibility } from './useFieldPath'
import { useFormBuilderContext } from './useFormBuilderContext'
import type { VisibilityFn } from '~/features/form-builder/types'
import type { ConditionGroup } from '~/features/form-builder/conditions'

/**
 * Composable to handle all shared setup logic for container fields (field-group, tabs)
 *
 * Responsibilities:
 * - Compute and provide field paths with proper nesting
 * - Manage visibility based on parent + own conditions
 * - Provide scoped form values to children (merging container data into root)
 * - Update parent visibility context
 *
 * @param name - Container field name
 * @param visibleWhen - Optional visibility condition (function, ComputedRef, or ConditionGroup)
 * @returns Object with computed paths, visibility, and scoped form values
 *
 * @example
 * ```ts
 * const { isVisible, scopedFormValues, fullPath } = useContainerFieldSetup(
 *   props.name,
 *   props.meta.visibleWhen
 * )
 * ```
 */
export function useContainerFieldSetup(name: string, visibleWhen?: VisibilityFn | ConditionGroup) {
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
    return checkFieldVisibility(
      { visibleWhen },
      { values: formValues.value, root: formValues.value },
      {
        parentVisible: parentGroupVisible()
      }
    )
  })

  // Update parent visibility context for children
  provide('parentGroupVisible', () => isVisible.value)

  // Provide the cumulative prefix to child fields
  provide('fieldPrefix', currentFieldPrefix.value)

  // Provide scoped form values to child fields
  // Creates FieldContext with proper scoping for nested containers
  const scopedFormValues = computed(() => {
    // Convert bracket notation to dot notation for getRecordAtPath
    // e.g., "messages[0]" -> "messages.0"
    const normalizedPath = relativePath.value.replace(/\[(\d+)\]/g, '.$1')
    const containerValue = getRecordAtPath(formValues.value, normalizedPath)

    // Get parent path (remove last segment) to access parent values
    const pathSegments = normalizedPath.split('.').filter(Boolean)
    const parentPath = pathSegments.slice(0, -1).join('.')
    const parentValue = parentPath
      ? getRecordAtPath(formValues.value, parentPath)
      : formValues.value

    // If we're inside an array item (detected by array index in path like "messages[0]")
    // Use the item's values as the base for resolving dynamic text (labels, descriptions)
    // This allows label functions in array itemFields to access item properties directly
    if (relativePath.value.includes('[') && containerValue) {
      return {
        values: containerValue || {},
        parent: parentValue || {},
        root: formValues.value || {}
      }
    }

    // For regular containers, merge container values with root form values
    return {
      values: { ...(formValues.value || {}), ...(containerValue || {}) },
      parent: parentValue || {},
      root: formValues.value || {}
    }
  })
  provide('scopedFormValues', scopedFormValues)

  return {
    relativePath,
    currentFieldPrefix,
    fullPath,
    isVisible,
    scopedFormValues,
    formValues
  }
}
