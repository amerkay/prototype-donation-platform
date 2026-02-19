/**
 * Composable for condition-based filter state
 * Provides form, filter values, predicate function, and URL sync
 */
import { ref, computed, watch, type MaybeRefOrGetter } from 'vue'
import type { ContextSchema } from '../conditions/types'
import { OPERATORS } from '../conditions/operators'
import { buildFilterForm } from '../conditions/ui/build-filter-form'
import type { FilterConditionValues, FilterStateOptions } from './types'

const DEFAULT_VALUES: FilterConditionValues = { match: 'all', conditions: [] }

/**
 * Get value at dot-notation path from an object
 */
function getValueAtPath(obj: unknown, path: string): unknown {
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

/**
 * Encode filter values to base64 for URL param
 */
function encodeFilters(values: FilterConditionValues): string {
  return btoa(JSON.stringify(values))
}

/**
 * Decode filter values from base64 URL param
 */
function decodeFilters(encoded: string): FilterConditionValues | null {
  try {
    return JSON.parse(atob(encoded)) as FilterConditionValues
  } catch {
    return null
  }
}

export function useFilterState(
  formId: string,
  contextSchema: MaybeRefOrGetter<ContextSchema>,
  options?: FilterStateOptions
) {
  const form = buildFilterForm(formId, contextSchema)
  const filterValues = ref<FilterConditionValues>({ ...DEFAULT_VALUES })

  // Hydrate from URL on creation
  if (import.meta.client) {
    const params = new URLSearchParams(window.location.search)
    const encoded = params.get('_f')
    if (encoded) {
      const decoded = decodeFilters(encoded)
      if (decoded) filterValues.value = decoded
    }
  }

  // URL sync: write filter state to URL
  watch(
    filterValues,
    (val) => {
      if (!import.meta.client) return
      const url = new URL(window.location.href)
      if (val.conditions.length > 0) {
        url.searchParams.set('_f', encodeFilters(val))
      } else {
        url.searchParams.delete('_f')
      }
      window.history.replaceState({}, '', url.toString())
    },
    { deep: true }
  )

  const activeFilterCount = computed(() => {
    return filterValues.value.conditions.filter((c) => c.field && c.operator).length
  })

  function resetFilters() {
    filterValues.value = { match: 'all', conditions: [] }
  }

  function filterItem(item: unknown): boolean {
    const { match, conditions } = filterValues.value
    const activeConditions = conditions.filter((c) => c.field && c.operator)

    if (activeConditions.length === 0) return true

    const results = activeConditions.map((condition) => {
      // Check for custom evaluator
      const evaluator = options?.customEvaluators?.[condition.field]
      if (evaluator) {
        return evaluator(condition.value, item, condition.operator)
      }

      const fieldValue = getValueAtPath(item, condition.field)
      const operatorFn = OPERATORS[condition.operator]
      if (!operatorFn) return true

      return operatorFn(fieldValue, condition.value)
    })

    switch (match) {
      case 'all':
        return results.every(Boolean)
      case 'any':
        return results.some(Boolean)
      case 'none':
        return !results.some(Boolean)
      default:
        return true
    }
  }

  return {
    form,
    filterValues,
    activeFilterCount,
    resetFilters,
    filterItem
  }
}
