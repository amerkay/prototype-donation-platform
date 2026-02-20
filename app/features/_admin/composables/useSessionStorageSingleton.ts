import { ref, type Ref } from 'vue'

/**
 * Factory for sessionStorage-backed singleton data stores.
 * Eliminates duplicated $hydrate/$persist boilerplate across composables.
 *
 * @param key - sessionStorage key
 * @param defaults - Default items when no saved data exists
 * @param options.migrate - Optional transform applied to each item on hydration (e.g. adding new fields)
 */
export function useSessionStorageSingleton<T>(
  key: string,
  defaults: T[],
  options?: { migrate?: (item: T) => T }
) {
  const items = ref<T[]>([]) as Ref<T[]>
  let hydrated = false

  function $hydrate(): void {
    if (hydrated) return
    if (!import.meta.client) return
    try {
      // TODO-SUPABASE: Replace sessionStorage.getItem with supabase.from(table).select('*').eq('org_id', orgId).single()
      const saved = sessionStorage.getItem(key)
      if (saved) {
        const parsed: T[] = JSON.parse(saved)
        items.value = options?.migrate ? parsed.map(options.migrate) : parsed
      } else {
        items.value = [...defaults]
      }
    } catch {
      items.value = [...defaults]
    }
    hydrated = true
  }

  function $persist(): void {
    if (!import.meta.client) return
    try {
      // TODO-SUPABASE: Replace sessionStorage.setItem with supabase.from(table).upsert({ org_id: orgId, ...data })
      sessionStorage.setItem(key, JSON.stringify(items.value))
    } catch {
      /* ignore */
    }
  }

  function ensureHydrated(): void {
    if (!hydrated) $hydrate()
  }

  return { items, $persist, ensureHydrated }
}
