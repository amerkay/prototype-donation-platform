import { computed } from 'vue'
import type { FieldContext, VisibilityFn } from '~/features/_library/form-builder/types'

/**
 * Unified field path and visibility utilities
 */

import type { ConditionGroup } from '~/features/_library/form-builder/conditions'
import { evaluateConditionGroup } from '~/features/_library/form-builder/conditions'

// ============================================================================
// PATH UTILITIES
// ============================================================================

/**
 * Join path segments, filtering out empty/undefined parts
 */
export function joinPath(...parts: Array<string | undefined>): string {
  return parts.filter((p): p is string => typeof p === 'string' && p.length > 0).join('.')
}

/**
 * Remove section prefix from a path to get relative path
 */
export function toSectionRelativePath(name: string, sectionId: string): string {
  if (!sectionId) return name
  if (name === sectionId) return ''
  return name.startsWith(`${sectionId}.`) ? name.slice(sectionId.length + 1) : name
}

/**
 * Resolve full vee-validate field path from relative name
 */
export function resolveVeeFieldPath(params: {
  name: string
  sectionId: string
  fieldPrefix?: string
}): string {
  const { name, sectionId, fieldPrefix } = params

  if (!sectionId) return name
  // Only treat as absolute path if it already includes the section prefix
  if (name.startsWith(`${sectionId}.`)) return name

  const relativePath = joinPath(fieldPrefix, name)
  return joinPath(sectionId, relativePath)
}

/**
 * Convert vee-validate field path to valid HTML ID
 * Replaces dots, brackets to ensure uniqueness and HTML validity
 *
 * @example
 * sanitizePathToId('test-section.testArray[0].name') // 'test-section_testArray_0__name'
 * sanitizePathToId('address.city') // 'address_city'
 */
export function sanitizePathToId(path: string): string {
  return path
    .replace(/\./g, '_') // dots to underscores
    .replace(/\[/g, '_') // opening brackets to underscores
    .replace(/\]/g, '') // remove closing brackets
}

/**
 * Check if a string part is a valid array index within bounds
 */
function isValidArrayIndex(part: string, array: unknown[]): boolean {
  const idx = Number(part)
  return Number.isFinite(idx) && idx >= 0 && idx < array.length
}

/**
 * Core path traversal function - navigates nested objects/arrays by dot-notation path
 *
 * @param root - Root object/array to traverse
 * @param path - Dot-notation path (e.g., 'address.city' or 'items.0.name')
 * @param options - Traversal options
 * @returns Traversal result with value and metadata
 */
function traversePath(
  root: unknown,
  path: string,
  options: { stopOnNull?: boolean } = {}
): { value: unknown; exists: boolean; valid: boolean } {
  if (!path) {
    return { value: root, exists: true, valid: true }
  }

  const parts = path.split('.')
  let current = root

  for (const part of parts) {
    // Stop traversal if current is null/undefined
    if (current == null) {
      return { value: undefined, exists: false, valid: options.stopOnNull !== false }
    }

    // Handle array traversal with index validation
    if (Array.isArray(current)) {
      if (!isValidArrayIndex(part, current)) {
        return { value: undefined, exists: false, valid: false }
      }
      current = current[Number(part)]
    }
    // Handle object traversal
    else if (typeof current === 'object') {
      current = (current as Record<string, unknown>)[part]
    }
    // Invalid path - trying to traverse into primitive
    else {
      return { value: undefined, exists: false, valid: false }
    }
  }

  return { value: current, exists: current !== undefined, valid: true }
}

/**
 * Get a record (object) at a specific path, returns undefined if not found or not an object
 *
 * @param root - Root object to traverse
 * @param path - Dot-notation path
 * @returns The record at the path, or undefined if not found/not an object
 */
export function getRecordAtPath(
  root: Record<string, unknown>,
  path: string
): Record<string, unknown> | undefined {
  const { value } = traversePath(root, path)

  // Only return if value is a non-array object
  if (value && typeof value === 'object' && !Array.isArray(value)) {
    return value as Record<string, unknown>
  }

  return undefined
}

/**
 * Check if a path exists in form values (validates array indices are within bounds)
 * Used to filter orphaned validation errors from removed array items
 *
 * @param path - Dot-notation path to check
 * @param values - Form values to validate against
 * @returns True if path exists and is valid (array indices in bounds)
 */
export function pathExistsInValues(path: string, values: unknown): boolean {
  const { valid } = traversePath(values, path, { stopOnNull: false })
  return valid
}

// ============================================================================
// VISIBILITY UTILITIES
// ============================================================================

/**
 * Check if a field should be visible based on its visibility condition and context
 * Unified visibility logic used across FormField, FormRenderer, and composables
 *
 * Supports both function-based and declarative (ConditionGroup) visibility conditions:
 * - Function: `(ctx: FieldContext) => boolean` - Evaluated directly
 * - ConditionGroup: Declarative object with conditions array - Evaluated using evaluateConditionGroup
 *
 * @param field - Field definition containing optional visibleWhen function or ConditionGroup
 * @param ctx - Field context with values to evaluate condition against
 * @param options - Additional visibility context
 * @returns True if field should be visible
 *
 * @example
 * ```ts
 * // Simple visibility check
 * const visible = checkFieldVisibility(fieldDef, ctx)
 *
 * // With parent visibility
 * const visible = checkFieldVisibility(fieldDef, ctx, { parentVisible: false })
 *
 * // Skip container validation (for validation rules)
 * const visible = checkFieldVisibility(fieldDef, ctx, {
 *   skipContainerValidation: true
 * })
 * ```
 */
export function checkFieldVisibility(
  field: {
    type?: string
    visibleWhen?: VisibilityFn | ConditionGroup
  },
  ctx: FieldContext,
  options: { parentVisible?: boolean; skipContainerValidation?: boolean } = {}
): boolean {
  const { parentVisible = true, skipContainerValidation = false } = options

  // Parent must be visible for child to be visible
  if (!parentVisible) return false

  // Container fields (field-group, tabs) should validate children even when collapsed
  // This ensures validation errors are tracked even if the container is hidden
  if (!skipContainerValidation) {
    const fieldType = field.type || ''
    const isContainerField = ['field-group', 'tabs', 'card'].includes(fieldType)
    if (isContainerField) return true
  }

  // No visibility condition means always visible
  if (!field.visibleWhen) return true

  // Evaluate visibility condition based on type
  if (typeof field.visibleWhen === 'function') {
    // Function-based condition (existing behavior)
    return field.visibleWhen(ctx)
  } else if ('value' in field.visibleWhen) {
    // ComputedRef<boolean>
    return field.visibleWhen.value
  } else {
    // Declarative ConditionGroup (new behavior)
    return evaluateConditionGroup(field.visibleWhen, ctx.values)
  }
}

// ============================================================================
// COMPOSABLE
// ============================================================================

/**
 * Composable to compute paths for container fields (field-group, tabs, array)
 * Handles path normalization and prefix accumulation for nested fields
 * Replaces useContainerFieldPaths composable
 *
 * @param name - Field name from props
 * @param sectionId - Section ID from context
 * @param parentFieldPrefix - Parent field prefix from context
 * @returns Object with computed paths: relativePath, currentFieldPrefix, fullPath
 *
 * @example
 * ```ts
 * const { sectionId, fieldPrefix: parentFieldPrefix } = useFormBuilderContext()
 * const { relativePath, currentFieldPrefix, fullPath } = useFieldPath({
 *   name: props.name,
 *   sectionId,
 *   parentFieldPrefix
 * })
 * ```
 */
export function useFieldPath(params: {
  name: string
  sectionId: string
  parentFieldPrefix: string
}) {
  const { name, sectionId, parentFieldPrefix } = params

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
