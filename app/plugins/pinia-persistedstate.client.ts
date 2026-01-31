import type { Pinia, Store } from 'pinia'

interface PersistedStore extends Store {
  $hydrate?: () => void
  $persist?: () => void
}

interface PiniaInternal extends Pinia {
  _s: Map<string, Store>
}

export default defineNuxtPlugin((nuxtApp) => {
  const pinia = nuxtApp.$pinia as PiniaInternal
  const hydratedStores = new Set<string>()

  // Function to hydrate a single store
  const hydrateStore = (store: PersistedStore) => {
    // Skip if already hydrated
    if (hydratedStores.has(store.$id)) return

    // If store has $hydrate method, restore its state
    if (typeof store.$hydrate === 'function') {
      store.$hydrate()
      hydratedStores.add(store.$id)

      // If store has $persist method, watch for changes
      if (typeof store.$persist === 'function') {
        store.$subscribe(() => store.$persist!())
      }
    }
  }

  // After Vue hydration completes, restore existing stores
  nuxtApp.hook('app:mounted', () => {
    pinia._s.forEach(hydrateStore)
  })

  // Also hydrate on page finish to catch stores loaded after app:mounted
  nuxtApp.hook('page:finish', () => {
    pinia._s.forEach(hydrateStore)
  })
})
