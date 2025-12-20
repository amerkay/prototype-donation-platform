import type { Pinia, Store } from 'pinia'

interface PersistedStore extends Store {
  $hydrate?: () => void
  $persist?: () => void
}

interface PiniaInternal extends Pinia {
  _s: Map<string, Store>
}

export default defineNuxtPlugin((nuxtApp) => {
  // After Vue hydration completes, restore all stores with $hydrate method
  nuxtApp.hook('app:mounted', () => {
    const pinia = nuxtApp.$pinia as PiniaInternal

    // Iterate all registered stores
    pinia._s.forEach((store: PersistedStore) => {
      // If store has $hydrate method, restore its state
      if (typeof store.$hydrate === 'function') {
        store.$hydrate()

        // If store has $persist method, watch for changes
        if (typeof store.$persist === 'function') {
          store.$subscribe(() => store.$persist!())
        }
      }
    })
  })
})
