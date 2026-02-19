import { ref, computed, watch, type Ref } from 'vue'

type SearchAccessor<T> = keyof T | ((item: T) => string | undefined)

/**
 * Debounced multi-field search across a list of items.
 * Simulates async search with a 300ms debounce for Supabase-ready UX.
 */
export function useQuickFind<T>(items: Ref<T[]>, searchFields: SearchAccessor<T>[]) {
  const query = ref('')
  const isSearching = ref(false)
  const debouncedQuery = ref('')

  let timer: ReturnType<typeof setTimeout> | undefined

  watch(query, (val) => {
    isSearching.value = true
    clearTimeout(timer)
    timer = setTimeout(() => {
      debouncedQuery.value = val
      isSearching.value = false
    }, 300)
  })

  const results = computed(() => {
    const q = debouncedQuery.value.toLowerCase().trim()
    if (!q) return items.value

    return items.value.filter((item) =>
      searchFields.some((field) => {
        const value =
          typeof field === 'function'
            ? field(item)
            : String((item as Record<string, unknown>)[field as string] ?? '')
        return value?.toLowerCase().includes(q)
      })
    )
  })

  return { query, results, isSearching }
}
