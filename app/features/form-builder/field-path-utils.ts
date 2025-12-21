export function joinPath(...parts: Array<string | undefined>): string {
  return parts.filter((p): p is string => typeof p === 'string' && p.length > 0).join('.')
}

export function toSectionRelativePath(name: string, sectionId: string): string {
  if (!sectionId) return name
  if (name === sectionId) return ''
  return name.startsWith(`${sectionId}.`) ? name.slice(sectionId.length + 1) : name
}

export function resolveVeeFieldPath(params: {
  name: string
  sectionId: string
  fieldPrefix?: string
}): string {
  const { name, sectionId, fieldPrefix } = params

  if (!sectionId) return name

  if (name === sectionId || name.startsWith(`${sectionId}.`)) return name

  const relativePath = joinPath(fieldPrefix, name)
  return joinPath(sectionId, relativePath)
}

export function getRecordAtPath(
  root: Record<string, unknown>,
  path: string
): Record<string, unknown> | undefined {
  if (!path) return root

  const value = path.split('.').reduce<unknown>((acc, part) => {
    if (!acc || typeof acc !== 'object') return undefined
    return (acc as Record<string, unknown>)[part]
  }, root)

  if (!value || typeof value !== 'object' || Array.isArray(value)) return undefined
  return value as Record<string, unknown>
}

/**
 * Check if a path exists in form values (validates array indices are within bounds)
 * Used to filter orphaned validation errors from removed array items
 */
export function pathExistsInValues(path: string, values: unknown): boolean {
  const parts = path.split('.')
  let current = values

  for (const part of parts) {
    if (current == null) return false

    if (Array.isArray(current)) {
      const idx = Number(part)
      if (!Number.isFinite(idx) || idx < 0 || idx >= current.length) return false
      current = current[idx]
    } else if (typeof current === 'object') {
      current = (current as Record<string, unknown>)[part]
    } else {
      return false
    }
  }

  return true
}
