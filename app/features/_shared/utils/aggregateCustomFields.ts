/** Merge customFields maps from an array of records into a single flat object */
export function aggregateCustomFields(
  items: { customFields?: Record<string, string> }[]
): Record<string, string> {
  const fields: Record<string, string> = {}
  for (const item of items) {
    if (item.customFields) {
      Object.assign(fields, item.customFields)
    }
  }
  return fields
}
