import { ref, type Ref } from 'vue'

interface SessionStorageOptions<T> {
  /** Optional transform applied to each item on hydration (e.g. adding new fields) */
  migrate?: (item: T) => T
  /** Optional async data fetcher — called on cache miss instead of using defaults.
   *  TODO-SUPABASE: Replace with supabase.from(table).select('*').eq('org_id', orgId) */
  fetcher?: () => Promise<T[]>
}

/**
 * Factory for sessionStorage-backed singleton data stores.
 * Eliminates duplicated $hydrate/$persist boilerplate across composables.
 *
 * When a `fetcher` is provided, cache misses call the fetcher instead of using
 * the static `defaults` array. This is the Supabase migration hook — swap the
 * fetcher implementation to make the store read from the database.
 *
 * @param key - sessionStorage key
 * @param defaults - Default items when no saved data exists (sync fallback)
 * @param options.migrate - Optional transform applied to each item on hydration
 * @param options.fetcher - Optional async data source (called on cache miss)
 */
export function useSessionStorageSingleton<T>(
  key: string,
  defaults: T[],
  options?: SessionStorageOptions<T>
) {
  const items = ref<T[]>([]) as Ref<T[]>
  const isLoading = ref(false)
  let hydrated = false
  let hydratePromise: Promise<void> | null = null

  function applyMigration(data: T[]): T[] {
    return options?.migrate ? data.map(options.migrate) : data
  }

  function hydrateSync(): void {
    if (hydrated) return
    if (!import.meta.client) return
    try {
      // TODO-SUPABASE: Replace sessionStorage.getItem with supabase query via fetcher
      const saved = sessionStorage.getItem(key)
      if (saved) {
        items.value = applyMigration(JSON.parse(saved))
      } else {
        items.value = [...defaults]
      }
    } catch {
      items.value = [...defaults]
    }
    hydrated = true
  }

  async function hydrateAsync(): Promise<void> {
    if (hydrated) return
    if (!import.meta.client) return
    try {
      const saved = sessionStorage.getItem(key)
      if (saved) {
        items.value = applyMigration(JSON.parse(saved))
        hydrated = true
        return
      }
    } catch {
      /* fall through to fetcher */
    }

    // Cache miss — call async fetcher
    isLoading.value = true
    try {
      const fetched = await options!.fetcher!()
      items.value = applyMigration(fetched)
      $persist()
    } catch {
      items.value = [...defaults]
    } finally {
      isLoading.value = false
      hydrated = true
    }
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

  function ensureHydrated(): Promise<void> | void {
    if (hydrated) return
    if (options?.fetcher) {
      if (!hydratePromise) hydratePromise = hydrateAsync()
      return hydratePromise
    }
    hydrateSync()
  }

  return { items, isLoading, $persist, ensureHydrated }
}
