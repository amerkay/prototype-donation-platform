import { computed } from 'vue'
import { toSectionRelativePath, joinPath } from '~/features/form-builder/field-path-utils'

/**
 * Composable to compute paths for container fields (field-group, tabs, array)
 * Handles path normalization and prefix accumulation for nested fields
 *
 * @param name - Field name from props
 * @param sectionId - Section ID from context
 * @param parentFieldPrefix - Parent field prefix from context
 * @returns Object with computed paths: relativePath, currentFieldPrefix, fullPath
 *
 * @example
 * ```ts
 * const { sectionId, fieldPrefix: parentFieldPrefix } = useFormBuilderContext()
 * const { relativePath, currentFieldPrefix, fullPath } = useContainerFieldPaths(
 *   props.name,
 *   sectionId,
 *   parentFieldPrefix
 * )
 * ```
 */
export function useContainerFieldPaths(name: string, sectionId: string, parentFieldPrefix: string) {
  // Normalize to section-relative path
  const relativePath = computed(() => {
    return toSectionRelativePath(name, sectionId)
  })

  // Compute cumulative field prefix for nested children
  const currentFieldPrefix = computed(() => {
    return joinPath(parentFieldPrefix, relativePath.value)
  })

  // Construct full vee-validate path for error detection
  const fullPath = computed(() => {
    return sectionId ? `${sectionId}.${currentFieldPrefix.value}` : currentFieldPrefix.value
  })

  return {
    relativePath,
    currentFieldPrefix,
    fullPath
  }
}
