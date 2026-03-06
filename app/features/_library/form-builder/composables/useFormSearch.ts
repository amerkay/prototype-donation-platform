import type { InjectionKey } from 'vue'
import type { FieldDef, FieldContext, TabsFieldDef, FieldGroupDef, VisibilityFn } from '../types'
import type { ConditionGroup } from '../conditions'
import { checkFieldVisibility } from './useFieldPath'

// ============================================================================
// TYPES
// ============================================================================

export interface SearchableEntry {
  /** Dot-notation path from form root */
  path: string
  /** Static or resolved label text */
  label: string
  /** Static description text */
  description: string
  /** Labels of ancestor groups/tabs for context display */
  parentLabels: string[]
  /** Visibility conditions from this entry and all ancestors (all must pass for entry to be visible) */
  visibilityChecks: Array<{ visibleWhen: VisibilityFn | ConditionGroup; valuesPath: string }>
}

export interface FormSearchState {
  /** Whether search is enabled for this form */
  isSearchEnabled: boolean
  /** Flat searchable index of all fields */
  searchIndex: SearchableEntry[]
  /** Check if an entry is visible based on its accumulated visibility checks */
  isEntryVisible: (entry: SearchableEntry) => boolean
}

export interface FormSearchOptions {
  /** Force-disable search even if form exceeds threshold */
  disableSearch?: boolean
  /** Minimum input field count to auto-enable search (default: 12) */
  searchThreshold?: number
}

/** Injection key for form search state */
export const FORM_SEARCH_KEY: InjectionKey<FormSearchState> = Symbol('formSearch')

// Display-only field types that don't count toward complexity
const DISPLAY_ONLY_TYPES = new Set([
  'alert',
  'card',
  'component',
  'hidden',
  'readonly',
  'section-heading'
])

// Types excluded from search indexing — same as DISPLAY_ONLY_TYPES but allows 'component'
// so componentField labels/descriptions are searchable
const NON_INDEXABLE_TYPES = new Set(['alert', 'card', 'hidden', 'readonly', 'section-heading'])

// ============================================================================
// FIELD COUNTING
// ============================================================================

/**
 * Recursively count input fields (excluding display-only types).
 * Used to determine if a form is complex enough to warrant search.
 */
export function countInputFields(fields: Record<string, FieldDef>): number {
  let count = 0
  for (const field of Object.values(fields)) {
    if (DISPLAY_ONLY_TYPES.has(field.type)) continue

    if (field.type === 'field-group') {
      const group = field as FieldGroupDef
      if (group.fields) {
        count += countInputFields(group.fields)
      }
    } else if (field.type === 'tabs') {
      const tabs = field as TabsFieldDef
      for (const tab of tabs.tabs) {
        count += countInputFields(tab.fields)
      }
    } else {
      count++
    }
  }
  return count
}

// ============================================================================
// SEARCH INDEX
// ============================================================================

/**
 * Recursively walk the field tree and build a flat searchable index.
 * Labels that are functions are called with an empty context (best-effort).
 */
function buildSearchIndex(
  fields: Record<string, FieldDef>,
  parentPath: string,
  parentLabels: string[],
  ancestorVisibilityChecks: Array<{
    visibleWhen: VisibilityFn | ConditionGroup
    valuesPath: string
  }> = []
): SearchableEntry[] {
  const entries: SearchableEntry[] = []
  const emptyCtx: FieldContext = { values: {}, root: {} }

  for (const [key, field] of Object.entries(fields)) {
    const fieldPath = parentPath ? `${parentPath}.${key}` : key

    // Accumulate visibility checks from this field + ancestors
    // valuesPath = parentPath so the visibleWhen fn receives local-scope values
    const fieldChecks = field.visibleWhen
      ? [...ancestorVisibilityChecks, { visibleWhen: field.visibleWhen, valuesPath: parentPath }]
      : ancestorVisibilityChecks

    if (field.type === 'field-group') {
      const group = field as FieldGroupDef
      const groupLabel = resolveLabel(group.label, emptyCtx)
      const newParentLabels = groupLabel ? [...parentLabels, groupLabel] : parentLabels

      // Index the group itself (so searching for group name shows it)
      if (groupLabel) {
        entries.push({
          path: fieldPath,
          label: groupLabel,
          description: typeof group.description === 'string' ? group.description : '',
          parentLabels,
          visibilityChecks: fieldChecks
        })
      }

      if (group.fields) {
        entries.push(...buildSearchIndex(group.fields, fieldPath, newParentLabels, fieldChecks))
      }
    } else if (field.type === 'tabs') {
      const tabs = field as TabsFieldDef
      const tabsLabel = resolveLabel(tabs.label, emptyCtx)
      const tabsParentLabels = tabsLabel ? [...parentLabels, tabsLabel] : parentLabels

      // Index the tabs container itself (e.g. "Donation Frequencies")
      if (tabsLabel) {
        entries.push({
          path: fieldPath,
          label: tabsLabel,
          description: typeof tabs.description === 'string' ? tabs.description : '',
          parentLabels,
          visibilityChecks: fieldChecks
        })
      }

      for (const tab of tabs.tabs) {
        const tabLabel = resolveLabel(tab.label, emptyCtx)
        const newParentLabels = tabLabel ? [...tabsParentLabels, tabLabel] : tabsParentLabels
        const tabPath = `${fieldPath}.${tab.value}`

        // Tabs can have their own visibleWhen — accumulate it
        const tabChecks = tab.visibleWhen
          ? [...fieldChecks, { visibleWhen: tab.visibleWhen, valuesPath: parentPath }]
          : fieldChecks

        // Index the tab trigger itself (so searching for tab name shows it)
        if (tabLabel) {
          entries.push({
            path: tabPath,
            label: tabLabel,
            description: '',
            parentLabels: tabsParentLabels,
            visibilityChecks: tabChecks
          })
        }

        entries.push(...buildSearchIndex(tab.fields, tabPath, newParentLabels, tabChecks))
      }
    } else if (!NON_INDEXABLE_TYPES.has(field.type)) {
      // Regular input field — index it
      const label = resolveLabel(field.label, emptyCtx)
      entries.push({
        path: fieldPath,
        label: label || key,
        description: typeof field.description === 'string' ? field.description : '',
        parentLabels,
        visibilityChecks: fieldChecks
      })
    }
  }

  return entries
}

/** Resolve a label that might be a string, ComputedRef, or function */
function resolveLabel(
  label: string | { value: string } | ((ctx: FieldContext) => string) | undefined,
  ctx: FieldContext
): string {
  if (!label) return ''
  if (typeof label === 'string') return label
  if (typeof label === 'function') {
    try {
      return label(ctx)
    } catch {
      return ''
    }
  }
  if ('value' in label) return label.value
  return ''
}

// ============================================================================
// SCOPED CONTEXT
// ============================================================================

/** Extract nested values at a dot-path to build a local-scope FieldContext */
function buildScopedContext(ctx: FieldContext, valuesPath: string): FieldContext {
  if (!valuesPath) return ctx
  let values: Record<string, unknown> = ctx.values as Record<string, unknown>
  for (const segment of valuesPath.split('.')) {
    const next = values?.[segment]
    if (next == null || typeof next !== 'object') return { values: {}, root: ctx.root }
    values = next as Record<string, unknown>
  }
  return { values, root: ctx.root }
}

// ============================================================================
// COMPOSABLE
// ============================================================================

/**
 * Provides a searchable index for complex forms.
 * Returns the index and a visibility checker — consumers use these
 * to power a Cmd+K Command dialog for field navigation.
 */
export function useFormSearch(
  fields: Record<string, FieldDef>,
  options?: FormSearchOptions,
  fieldContext?: () => FieldContext
): FormSearchState {
  const threshold = options?.searchThreshold ?? 12
  const isSearchEnabled = !options?.disableSearch && countInputFields(fields) >= threshold

  // Build index once (labels are resolved with empty context — good enough for search)
  const searchIndex = buildSearchIndex(fields, '', [])

  // Check if an entry is visible based on its accumulated visibility checks
  const isEntryVisible = (entry: SearchableEntry): boolean => {
    if (entry.visibilityChecks.length === 0) return true
    const ctx = fieldContext?.()
    if (!ctx) return true

    for (const check of entry.visibilityChecks) {
      const scopedCtx = check.valuesPath ? buildScopedContext(ctx, check.valuesPath) : ctx
      if (
        !checkFieldVisibility({ visibleWhen: check.visibleWhen }, scopedCtx, {
          skipContainerValidation: true
        })
      ) {
        return false
      }
    }
    return true
  }

  return {
    isSearchEnabled,
    searchIndex,
    isEntryVisible
  }
}
