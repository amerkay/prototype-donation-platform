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
