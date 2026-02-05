import { computed } from 'vue'
import type { ComposableForm, FieldDef, FieldGroupConfig } from '../types'

/**
 * Store mapping configuration extracted from form definition
 *
 * Maps form field paths to store property paths using conventions and metadata.
 * Used by auto-mapping in admin config forms to eliminate getData/setData boilerplate.
 */
export interface StoreMapping {
  /** Map of form path → store path (e.g., 'settings.name' → 'name') */
  paths: Map<string, string>
  /** Fields excluded from mapping (component fields, $storePath: null) */
  excluded: Set<string>
}

/**
 * Generate store mapping from form definition
 *
 * Traverses form field structure to extract mapping conventions:
 * - Default: fieldGroup('name', ...) → store.name
 * - Override: $storePath: 'custom' → store.custom
 * - Exclude: $storePath: null → skip
 * - Granular: $storePath: { field: 'path' } → per-field mapping
 * - Component fields: automatically excluded
 *
 * @example
 * ```ts
 * const form = defineForm('test', () => ({
 *   settings: fieldGroup('settings', {
 *     fields: { name: textField('name', {...}) }
 *   })
 * }))
 *
 * const mapping = generateStoreMapping(form)
 * // mapping.paths: Map { 'settings' => 'settings', 'settings.name' => 'settings.name' }
 * ```
 */
export function generateStoreMapping(form: ComposableForm): StoreMapping {
  const paths = new Map<string, string>()
  const excluded = new Set<string>()

  // Call form setup with empty context to get field structure
  const ctx = {
    values: computed(() => ({})),
    form: computed(() => ({})),
    title: undefined,
    description: undefined
  }
  const fields = form.setup(ctx)

  // Recursively traverse fields to build mapping
  function traverse(fields: Record<string, FieldDef>, prefix = '') {
    for (const [key, field] of Object.entries(fields)) {
      const formPath = prefix ? `${prefix}.${key}` : key

      if (field.type === 'field-group') {
        const group = field as FieldDef & FieldGroupConfig

        // Check for explicit store path metadata
        if (group.$storePath === null) {
          // Exclude from mapping (component field wrapper, preview, etc.)
          excluded.add(formPath)
        } else if (group.$storePath && typeof group.$storePath === 'string') {
          // Use explicit path for entire group
          // NOTE: Don't add the group itself to paths - only process nested fields
          // Recursively map nested fields with new base path
          if (group.fields) {
            traverse(group.fields, formPath)
          }
        } else if (group.$storePath && typeof group.$storePath === 'object') {
          // Granular per-field mapping
          for (const [fieldName, storePath] of Object.entries(group.$storePath)) {
            const fieldPath = `${formPath}.${fieldName}`
            paths.set(fieldPath, storePath)
          }
          // Don't map the group itself - only explicit fields
        } else {
          // Convention: use field name as store path
          // NOTE: Don't add the group itself to paths - only process nested fields
          // Recursively map nested fields
          if (group.fields) {
            traverse(group.fields, formPath)
          }
        }
      } else if (field.type === 'component') {
        // Component fields never map to store by default
        excluded.add(formPath)
      } else {
        // Regular field (leaf node) - use convention (inherit parent path)
        if (!excluded.has(prefix)) {
          paths.set(formPath, formPath)
        }
      }
    }
  }

  traverse(fields)

  return { paths, excluded }
}

/**
 * Generate getData function from store mapping
 *
 * Creates a function that extracts form data from store using the mapping.
 * Handles nested paths and converts store structure to form structure.
 *
 * @example
 * ```ts
 * const mapping = generateStoreMapping(form)
 * const getData = generateGetData(mapping)
 *
 * const store = { settings: { name: 'Test' } }
 * const formData = getData(store)
 * // formData: { settings: { name: 'Test' } }
 * ```
 */
export function generateGetData<TStore>(mapping: StoreMapping) {
  return (store: TStore): Record<string, unknown> => {
    const result: Record<string, unknown> = {}

    for (const [formPath, storePath] of mapping.paths.entries()) {
      // Parse paths
      const formSegments = formPath.split('.')
      const storeSegments = storePath.split('.')

      // Get value from store
      let value: unknown = store
      for (const segment of storeSegments) {
        value = (value as Record<string, unknown>)?.[segment]
      }

      // Set value in result object (build nested structure)
      let target: Record<string, unknown> = result
      for (let i = 0; i < formSegments.length - 1; i++) {
        const segment = formSegments[i]!
        if (!target[segment]) {
          target[segment] = {}
        }
        target = target[segment] as Record<string, unknown>
      }
      const lastSegment = formSegments[formSegments.length - 1]!
      target[lastSegment] = value
    }

    return result
  }
}

/**
 * Generate setData function from store mapping
 *
 * Creates a function that updates store from form data using the mapping.
 * Handles nested paths and converts form structure to store structure.
 * Automatically calls store.markDirty() after updating.
 *
 * @example
 * ```ts
 * const mapping = generateStoreMapping(form)
 * const setData = generateSetData(mapping)
 *
 * const store = { settings: { name: 'Old' }, markDirty: () => {} }
 * setData(store, { settings: { name: 'New' } })
 * // store.settings.name === 'New'
 * // store.markDirty() called
 * ```
 */
export function generateSetData<TStore extends { markDirty: () => void }>(mapping: StoreMapping) {
  return (store: TStore, data: Record<string, unknown>): void => {
    let hasChanges = false

    for (const [formPath, storePath] of mapping.paths.entries()) {
      // Parse paths
      const formSegments = formPath.split('.')
      const storeSegments = storePath.split('.')

      // Get value from form data
      let value: unknown = data
      for (const segment of formSegments) {
        value = (value as Record<string, unknown>)?.[segment]
        if (value === undefined) break
      }

      if (value !== undefined) {
        // Resolve store target (skip if intermediate is missing)
        let target: Record<string, unknown> = store as Record<string, unknown>
        for (let i = 0; i < storeSegments.length - 1; i++) {
          const segment = storeSegments[i]!
          target = target[segment] as Record<string, unknown>
          if (!target) break
        }
        if (!target) continue

        // Get old value from store for comparison
        const lastSegment = storeSegments[storeSegments.length - 1]!
        const oldValue = target[lastSegment]

        // Check if value actually changed
        const valueChanged = JSON.stringify(oldValue) !== JSON.stringify(value)
        if (valueChanged) {
          hasChanges = true
        }

        // Set value in store
        target[lastSegment] = value
      }
    }

    // Only mark dirty when values actually changed
    if (hasChanges) {
      store.markDirty()
    }
  }
}
