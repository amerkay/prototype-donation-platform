/**
 * Get value at dot-notation path from an object.
 * Supports nested objects and arrays.
 * First checks for literal key match before splitting by dots.
 *
 * @example
 * getValueAtPath({ user: { name: 'John' } }, 'user.name') // 'John'
 * getValueAtPath({ items: [{ id: 1 }] }, 'items.0.id') // 1
 * getValueAtPath({ 'donation.amount': 10 }, 'donation.amount') // 10 (literal key)
 */
export function getValueAtPath(obj: unknown, path: string): unknown {
  if (!path || obj == null) return undefined
  const record = obj as Record<string, unknown>
  if (path in record) return record[path]

  const keys = path.split('.')
  let current: unknown = obj
  for (const key of keys) {
    if (current == null) return undefined
    current = (current as Record<string, unknown>)[key]
  }
  return current
}
