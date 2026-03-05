import { ref, computed, type Ref, type ComputedRef, type InjectionKey } from 'vue'
import type { FieldDef, FieldContext, TabsFieldDef, FieldGroupDef } from '../types'

// ============================================================================
// TYPES
// ============================================================================

interface SearchableEntry {
  /** Dot-notation path from form root */
  path: string
  /** Static or resolved label text */
  label: string
  /** Static description text */
  description: string
  /** Labels of ancestor groups/tabs for context display */
  parentLabels: string[]
  /** All ancestor tab values (innermost last), for counting matches at every nesting level */
  tabValues: string[]
  /** Paths of ancestor fieldGroups (for force-expanding) */
  groupPaths: string[]
}

export interface FormSearchState {
  /** The current search term */
  searchTerm: Ref<string>
  /** Whether search is actively filtering */
  isSearchActive: ComputedRef<boolean>
  /** Whether search is enabled for this form */
  isSearchEnabled: boolean
  /** Check if a field path should be visible given the current search */
  isFieldVisibleBySearch: (path: string) => boolean
  /** Set of group paths that should be force-expanded */
  expandedGroupPaths: ComputedRef<Set<string>>
  /** Tab value to auto-switch to (first matching tab) */
  activeTabOverride: ComputedRef<string | undefined>
  /** Number of leaf (input) fields matching the search */
  matchCount: ComputedRef<number>
  /** Match counts per tab value (for per-tab badges) */
  tabMatchCounts: ComputedRef<Map<string, number>>
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
const DISPLAY_ONLY_TYPES = new Set(['alert', 'card', 'component', 'hidden', 'readonly'])

// Types excluded from search indexing — same as DISPLAY_ONLY_TYPES but allows 'component'
// so componentField labels/descriptions are searchable
const NON_INDEXABLE_TYPES = new Set(['alert', 'card', 'hidden', 'readonly'])

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
  ancestorTabValues: string[] = [],
  ancestorGroupPaths: string[] = []
): SearchableEntry[] {
  const entries: SearchableEntry[] = []
  const emptyCtx: FieldContext = { values: {}, root: {} }

  for (const [key, field] of Object.entries(fields)) {
    const fieldPath = parentPath ? `${parentPath}.${key}` : key

    if (field.type === 'field-group') {
      const group = field as FieldGroupDef
      const groupLabel = resolveLabel(group.label, emptyCtx)
      const newParentLabels = groupLabel ? [...parentLabels, groupLabel] : parentLabels
      const newGroupPaths = [...ancestorGroupPaths, fieldPath]

      // Index the group itself (so searching for group name shows it)
      if (groupLabel) {
        entries.push({
          path: fieldPath,
          label: groupLabel,
          description: typeof group.description === 'string' ? group.description : '',
          parentLabels,
          tabValues: ancestorTabValues,
          groupPaths: ancestorGroupPaths
        })
      }

      if (group.fields) {
        entries.push(
          ...buildSearchIndex(
            group.fields,
            fieldPath,
            newParentLabels,
            ancestorTabValues,
            newGroupPaths
          )
        )
      }
    } else if (field.type === 'tabs') {
      const tabs = field as TabsFieldDef
      for (const tab of tabs.tabs) {
        const tabLabel = resolveLabel(tab.label, emptyCtx)
        const newParentLabels = tabLabel ? [...parentLabels, tabLabel] : parentLabels
        const tabPath = `${fieldPath}.${tab.value}`

        entries.push(
          ...buildSearchIndex(
            tab.fields,
            tabPath,
            newParentLabels,
            [...ancestorTabValues, tab.value],
            ancestorGroupPaths
          )
        )
      }
    } else if (!NON_INDEXABLE_TYPES.has(field.type)) {
      // Regular input field — index it
      const label = resolveLabel(field.label, emptyCtx)
      entries.push({
        path: fieldPath,
        label: label || key,
        description: typeof field.description === 'string' ? field.description : '',
        parentLabels,
        tabValues: ancestorTabValues,
        groupPaths: ancestorGroupPaths
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
// COMPOSABLE
// ============================================================================

/**
 * Provides search/filter functionality for complex forms.
 * Returns reactive search state that integrates with FormFieldList, FormFieldGroup, and FormFieldTabs.
 */
export function useFormSearch(
  fields: Record<string, FieldDef>,
  options?: FormSearchOptions
): FormSearchState {
  const threshold = options?.searchThreshold ?? 12
  const isSearchEnabled = !options?.disableSearch && countInputFields(fields) >= threshold

  const searchTerm = ref('')
  const isSearchActive = computed(() => searchTerm.value.trim().length > 0)

  // Build index once (labels are resolved with empty context — good enough for search)
  const searchIndex = buildSearchIndex(fields, '', [])

  // Compute matched paths when search term changes
  const matchResult = computed(() => {
    const term = searchTerm.value.trim().toLowerCase()
    if (!term)
      return {
        paths: new Set<string>(),
        groupPaths: new Set<string>(),
        tabValue: undefined as string | undefined,
        matchCount: 0,
        tabMatchCounts: new Map<string, number>()
      }

    const matchedPaths = new Set<string>()
    const matchedGroupPaths = new Set<string>()
    const tabCounts = new Map<string, number>()
    let leafMatches = 0

    for (const entry of searchIndex) {
      const haystack =
        `${entry.label} ${entry.description} ${entry.parentLabels.join(' ')}`.toLowerCase()
      if (haystack.includes(term)) {
        matchedPaths.add(entry.path)
        leafMatches++

        // Add all ancestor paths so parent containers stay visible
        const parts = entry.path.split('.')
        for (let i = 1; i < parts.length; i++) {
          matchedPaths.add(parts.slice(0, i).join('.'))
        }

        // Track groups to force-expand
        for (const gp of entry.groupPaths) {
          matchedGroupPaths.add(gp)
        }

        // Track per-tab match counts (count for ALL ancestor tabs, not just innermost)
        for (const tv of entry.tabValues) {
          tabCounts.set(tv, (tabCounts.get(tv) || 0) + 1)
        }
      }
    }

    // Pick the tab with the most matches (best-match, not first-match)
    let bestTabValue: string | undefined
    let bestTabCount = 0
    for (const [tabValue, count] of tabCounts) {
      if (count > bestTabCount) {
        bestTabCount = count
        bestTabValue = tabValue
      }
    }

    return {
      paths: matchedPaths,
      groupPaths: matchedGroupPaths,
      tabValue: bestTabValue,
      matchCount: leafMatches,
      tabMatchCounts: tabCounts
    }
  })

  const isFieldVisibleBySearch = (path: string): boolean => {
    if (!isSearchActive.value) return true
    return matchResult.value.paths.has(path)
  }

  const expandedGroupPaths = computed(() => matchResult.value.groupPaths)
  const activeTabOverride = computed(() => matchResult.value.tabValue)
  const matchCount = computed(() => matchResult.value.matchCount)
  const tabMatchCounts = computed(() => matchResult.value.tabMatchCounts)

  return {
    searchTerm,
    isSearchActive,
    isSearchEnabled,
    isFieldVisibleBySearch,
    expandedGroupPaths,
    activeTabOverride,
    matchCount,
    tabMatchCounts
  }
}
