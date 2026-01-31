import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { defineStore, createPinia, setActivePinia, type Pinia, type Store } from 'pinia'
import { ref, nextTick } from 'vue'

/**
 * Tests for the pinia-persistedstate plugin
 *
 * This plugin hydrates Pinia stores that have $hydrate and $persist methods.
 * It runs on both app:mounted and page:finish hooks to catch stores that
 * register late (like after layout changes), and prevents duplicate hydration.
 *
 * Key behaviors tested:
 * 1. Plugin automatically calls $hydrate on stores (no manual call needed)
 * 2. Plugin subscribes to store changes and calls $persist
 * 3. Stores registered after app:mounted get hydrated on page:finish
 * 4. Stores are not hydrated multiple times (deduplication)
 */

interface PiniaInternal extends Pinia {
  _s: Map<string, Store>
}

/**
 * Creates a mock nuxtApp with controllable hooks for testing the plugin
 */
function createMockNuxtApp(pinia: PiniaInternal) {
  const hooks: Record<string, Array<() => void>> = {}

  return {
    $pinia: pinia,
    hook: (name: string, callback: () => void) => {
      if (!hooks[name]) hooks[name] = []
      hooks[name].push(callback)
    },
    // Test helper to trigger hooks
    triggerHook: (name: string) => {
      hooks[name]?.forEach((cb) => cb())
    },
    // Test helper to check registered hooks
    getRegisteredHooks: () => Object.keys(hooks)
  }
}

/**
 * Import and run the plugin setup function
 * This tests the actual plugin code, not a simulation
 */
async function setupPlugin(nuxtApp: ReturnType<typeof createMockNuxtApp>) {
  // Dynamic import to get fresh plugin instance each test
  const pluginModule = await import('~/plugins/pinia-persistedstate.client')
  // The default export is the plugin function wrapped by defineNuxtPlugin
  // We need to call it with nuxtApp
  const plugin = pluginModule.default
  // @ts-expect-error - mocked nuxtApp
  plugin(nuxtApp)
  return nuxtApp
}

describe('pinia-persistedstate plugin', () => {
  let pinia: PiniaInternal

  beforeEach(() => {
    // Clear storage before each test
    if (typeof sessionStorage !== 'undefined') {
      sessionStorage.clear()
    }
    // Fresh pinia instance
    pinia = createPinia() as PiniaInternal
    setActivePinia(pinia)
    // Reset module cache to get fresh plugin instance
    vi.resetModules()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('hook registration', () => {
    it('registers app:mounted hook', async () => {
      const nuxtApp = createMockNuxtApp(pinia)
      await setupPlugin(nuxtApp)

      expect(nuxtApp.getRegisteredHooks()).toContain('app:mounted')
    })

    it('registers page:finish hook for late store hydration', async () => {
      const nuxtApp = createMockNuxtApp(pinia)
      await setupPlugin(nuxtApp)

      // The working plugin registers BOTH hooks
      // The broken plugin only registers app:mounted
      expect(nuxtApp.getRegisteredHooks()).toContain('page:finish')
    })
  })

  describe('automatic store hydration', () => {
    it('hydrates stores when app:mounted fires', async () => {
      let hydrated = false

      const useTestStore = defineStore('hydrate-on-mount', () => {
        const value = ref('initial')
        function $hydrate() {
          hydrated = true
          value.value = 'restored'
        }
        function $persist() {}
        return { value, $hydrate, $persist }
      })

      // Create store instance (registers it in pinia._s)
      const store = useTestStore()
      expect(store.value).toBe('initial')

      // Setup plugin and trigger app:mounted
      const nuxtApp = createMockNuxtApp(pinia)
      await setupPlugin(nuxtApp)
      nuxtApp.triggerHook('app:mounted')

      // Plugin should have called $hydrate
      expect(hydrated).toBe(true)
      expect(store.value).toBe('restored')
    })

    it('hydrates stores registered after app:mounted via page:finish', async () => {
      const hydratedStores: string[] = []

      // Setup plugin first
      const nuxtApp = createMockNuxtApp(pinia)
      await setupPlugin(nuxtApp)

      // Trigger app:mounted (no stores yet)
      nuxtApp.triggerHook('app:mounted')

      // Now create a store AFTER app:mounted (simulates page navigation)
      const useLateStore = defineStore('late-registered-store', () => {
        const value = ref('initial')
        function $hydrate() {
          hydratedStores.push('late-registered-store')
          value.value = 'restored'
        }
        function $persist() {}
        return { value, $hydrate, $persist }
      })

      const lateStore = useLateStore()
      expect(lateStore.value).toBe('initial')

      // Trigger page:finish (simulates navigation completing)
      nuxtApp.triggerHook('page:finish')

      // The late store should now be hydrated
      expect(hydratedStores).toContain('late-registered-store')
      expect(lateStore.value).toBe('restored')
    })

    it('does not hydrate the same store multiple times', async () => {
      let hydrateCount = 0

      const useTestStore = defineStore('no-duplicate-hydration', () => {
        const value = ref('initial')
        function $hydrate() {
          hydrateCount++
          value.value = 'restored'
        }
        function $persist() {}
        return { value, $hydrate, $persist }
      })

      // Create store
      useTestStore()

      // Setup plugin
      const nuxtApp = createMockNuxtApp(pinia)
      await setupPlugin(nuxtApp)

      // Trigger both hooks (as happens in real navigation)
      nuxtApp.triggerHook('app:mounted')
      nuxtApp.triggerHook('page:finish')
      nuxtApp.triggerHook('page:finish') // Multiple page navigations

      // Store should only be hydrated ONCE
      expect(hydrateCount).toBe(1)
    })

    it('subscribes to store changes and calls $persist', async () => {
      const persistedValues: number[] = []

      const useTestStore = defineStore('persist-on-change', () => {
        const count = ref(0)
        function $hydrate() {
          count.value = 10
        }
        function $persist() {
          persistedValues.push(count.value)
        }
        function increment() {
          count.value++
        }
        return { count, increment, $hydrate, $persist }
      })

      // Create store
      const store = useTestStore()

      // Setup plugin and trigger hydration
      const nuxtApp = createMockNuxtApp(pinia)
      await setupPlugin(nuxtApp)
      nuxtApp.triggerHook('app:mounted')

      // Clear persist calls from hydration
      persistedValues.length = 0

      // Change store state
      store.increment()
      await nextTick()

      // Plugin subscription should have called $persist
      expect(persistedValues).toContain(11)
    })
  })

  describe('graceful handling', () => {
    it('handles stores without $hydrate method gracefully', async () => {
      const useRegularStore = defineStore('no-hydrate-method', () => {
        const value = ref('test')
        return { value }
      })

      // Create store
      const store = useRegularStore()

      // Setup plugin and trigger hooks - should not throw
      const nuxtApp = createMockNuxtApp(pinia)
      await setupPlugin(nuxtApp)

      expect(() => {
        nuxtApp.triggerHook('app:mounted')
        nuxtApp.triggerHook('page:finish')
      }).not.toThrow()

      // Store value should be unchanged
      expect(store.value).toBe('test')
    })

    it('handles stores with $hydrate but no $persist', async () => {
      let hydrated = false

      const useTestStore = defineStore('hydrate-only', () => {
        const value = ref('initial')
        function $hydrate() {
          hydrated = true
          value.value = 'restored'
        }
        // No $persist method
        return { value, $hydrate }
      })

      const store = useTestStore()

      const nuxtApp = createMockNuxtApp(pinia)
      await setupPlugin(nuxtApp)
      nuxtApp.triggerHook('app:mounted')

      // Should hydrate successfully
      expect(hydrated).toBe(true)
      expect(store.value).toBe('restored')
    })
  })

  describe('persistence lifecycle', () => {
    it('restores state from storage on hydrate and persists on change', async () => {
      const storageKey = 'lifecycle-test'

      const useTestStore = defineStore('full-lifecycle', () => {
        const count = ref(0)
        function $hydrate() {
          const saved = sessionStorage.getItem(storageKey)
          if (saved) {
            count.value = JSON.parse(saved).count
          }
        }
        function $persist() {
          sessionStorage.setItem(storageKey, JSON.stringify({ count: count.value }))
        }
        function increment() {
          count.value++
        }
        return { count, increment, $hydrate, $persist }
      })

      // Pre-populate storage
      sessionStorage.setItem(storageKey, JSON.stringify({ count: 5 }))

      // Create store
      const store = useTestStore()
      expect(store.count).toBe(0) // Not yet hydrated

      // Setup plugin and trigger hydration
      const nuxtApp = createMockNuxtApp(pinia)
      await setupPlugin(nuxtApp)
      nuxtApp.triggerHook('app:mounted')

      // Should have restored from storage
      expect(store.count).toBe(5)

      // Make a change
      store.increment()
      await nextTick()

      // Should have persisted to storage
      const saved = sessionStorage.getItem(storageKey)
      expect(JSON.parse(saved!).count).toBe(6)
    })
  })
})
