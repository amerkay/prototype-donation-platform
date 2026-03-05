import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import { defineComponent, ref, reactive, computed, nextTick } from 'vue'
import { useEditState, type EditableStore } from '~/features/_shared/composables/useEditState'

// Stub vue-router's onBeforeRouteLeave (no actual navigation in unit tests)
vi.mock('vue-router', async () => {
  const actual = await vi.importActual<typeof import('vue-router')>('vue-router')
  return { ...actual, onBeforeRouteLeave: vi.fn() }
})

/** Create a mock store implementing EditableStore with reactive data */
function createMockStore(initialData: Record<string, unknown> = {}): EditableStore & {
  data: Record<string, unknown>
  initArgs: unknown[]
} {
  const data = reactive<Record<string, unknown>>({ ...initialData })
  const store: EditableStore & { data: Record<string, unknown>; initArgs: unknown[] } = {
    isDirty: false,
    isSaving: false,
    data,
    initArgs: [],
    markDirty() {
      this.isDirty = true
    },
    markClean() {
      this.isDirty = false
    },
    initialize(...args: unknown[]) {
      this.initArgs = args
      if (args.length === 1 && typeof args[0] === 'object' && args[0] !== null) {
        for (const k of Object.keys(data)) {
          // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
          delete data[k]
        }
        Object.assign(data, args[0])
      }
    }
  }
  return store
}

/** Create a mock store that accepts tuple initialization (like formConfigStore) */
function createTupleStore() {
  const config = ref<Record<string, unknown>>({ version: '1.0', amounts: { single: 10 } })
  const products = ref<unknown[]>([])
  const formId = ref<string | null>('form-1')

  const store: EditableStore & {
    config: typeof config
    products: typeof products
    formId: typeof formId
    initCalls: unknown[][]
  } = {
    isDirty: false,
    isSaving: false,
    config,
    products,
    formId,
    initCalls: [],
    markDirty() {
      this.isDirty = true
    },
    markClean() {
      this.isDirty = false
    },
    initialize(...args: unknown[]) {
      this.initCalls.push(args)
      if (args.length >= 1) config.value = { ...(args[0] as Record<string, unknown>) }
      if (args.length >= 2) products.value = [...(args[1] as unknown[])]
      if (args.length >= 3) formId.value = args[2] as string
    }
  }
  return store
}

/**
 * Mount a wrapper component that calls useEditState, providing component lifecycle context.
 */
async function mountWithEditState(options: {
  primaryData: Record<string, unknown>
  additionalStores?: Array<{
    store: EditableStore
    originalData: () => unknown
  }>
  onSave?: () => Promise<void>
}) {
  const primaryStore = createMockStore(options.primaryData)
  const formRef = ref({ isValid: true })

  const originalData = computed(() => ({ ...primaryStore.data }))

  const additionalStoreEntries = options.additionalStores?.map((s) => ({
    store: s.store,
    originalData: computed(s.originalData)
  }))

  let editStateResult: ReturnType<typeof useEditState> | undefined

  const Wrapper = defineComponent({
    setup() {
      editStateResult = useEditState({
        store: primaryStore,
        formRef,
        originalData,
        additionalStores: additionalStoreEntries,
        onSave: options.onSave ?? (async () => {})
      })
      return () => null
    }
  })

  const wrapper = await mountSuspended(Wrapper)

  return { wrapper, primaryStore, editStateResult: editStateResult!, formRef }
}

describe('useEditState', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  describe('no additionalStores: existing behavior', () => {
    it('markDirty stays false when data unchanged', async () => {
      const { primaryStore } = await mountWithEditState({
        primaryData: { name: 'Test' }
      })

      primaryStore.markDirty()
      expect(primaryStore.isDirty).toBe(false)
    })

    it('markDirty becomes true when data changes', async () => {
      const { primaryStore } = await mountWithEditState({
        primaryData: { name: 'Test' }
      })

      primaryStore.data.name = 'Changed'
      primaryStore.markDirty()
      expect(primaryStore.isDirty).toBe(true)
    })
  })

  describe('additionalStores: smart markDirty', () => {
    it('overrides markDirty with snapshot comparison — no false positive on load', async () => {
      const additionalStore = createMockStore({ amount: 10 })
      const additionalData = { amount: 10 }

      await mountWithEditState({
        primaryData: { name: 'Test' },
        additionalStores: [
          {
            store: additionalStore,
            originalData: () => ({ ...additionalData })
          }
        ]
      })

      // markDirty called unconditionally (simulating setData) — should NOT be dirty
      additionalStore.markDirty()
      expect(additionalStore.isDirty).toBe(false)
    })

    it('detects actual changes in additional store', async () => {
      const additionalData = ref({ amount: 10 })
      const additionalStore = createMockStore({ amount: 10 })

      await mountWithEditState({
        primaryData: { name: 'Test' },
        additionalStores: [
          {
            store: additionalStore,
            originalData: () => additionalData.value
          }
        ]
      })

      // Mutate the data
      additionalData.value = { amount: 99 }
      additionalStore.markDirty()
      expect(additionalStore.isDirty).toBe(true)
    })
  })

  describe('additionalStores: primary isDirty reflects combined state', () => {
    it('additional store markDirty auto-syncs primary isDirty (leave guard scenario)', async () => {
      const additionalData = ref({ amount: 10 })
      const additionalStore = createMockStore({ amount: 10 })

      const { primaryStore } = await mountWithEditState({
        primaryData: { name: 'Test' },
        additionalStores: [
          {
            store: additionalStore,
            originalData: () => additionalData.value
          }
        ]
      })

      // Only the additional store changes — simulates editing donation amounts
      additionalData.value = { amount: 99 }
      additionalStore.markDirty()

      // Primary store isDirty must be true WITHOUT calling primaryStore.markDirty()
      // This is critical: the leave guard checks store.isDirty directly
      expect(additionalStore.isDirty).toBe(true)
      expect(primaryStore.isDirty).toBe(true)
    })

    it('primary isDirty is true when only primary store has changes', async () => {
      const additionalStore = createMockStore({ amount: 10 })

      const { primaryStore } = await mountWithEditState({
        primaryData: { name: 'Test' },
        additionalStores: [
          {
            store: additionalStore,
            originalData: () => ({ amount: 10 })
          }
        ]
      })

      primaryStore.data.name = 'Changed'
      primaryStore.markDirty()
      expect(primaryStore.isDirty).toBe(true)
    })

    it('primary isDirty clears when additional store reverts to saved state', async () => {
      const additionalData = ref({ amount: 10 })
      const additionalStore = createMockStore({ amount: 10 })

      const { primaryStore } = await mountWithEditState({
        primaryData: { name: 'Test' },
        additionalStores: [
          {
            store: additionalStore,
            originalData: () => additionalData.value
          }
        ]
      })

      // Make dirty
      additionalData.value = { amount: 99 }
      additionalStore.markDirty()
      expect(primaryStore.isDirty).toBe(true)

      // Revert to original value
      additionalData.value = { amount: 10 }
      additionalStore.markDirty()
      expect(additionalStore.isDirty).toBe(false)
      expect(primaryStore.isDirty).toBe(false)
    })
  })

  describe('additionalStores: handleSave snapshots and cleans', () => {
    it('cleans all stores on save', async () => {
      const additionalData = ref({ amount: 10 })
      const additionalStore = createMockStore({ amount: 10 })

      const { primaryStore, editStateResult } = await mountWithEditState({
        primaryData: { name: 'Test' },
        additionalStores: [
          {
            store: additionalStore,
            originalData: () => additionalData.value
          }
        ]
      })

      // Make changes
      additionalData.value = { amount: 99 }
      additionalStore.markDirty()
      primaryStore.data.name = 'Changed'
      primaryStore.markDirty()
      expect(primaryStore.isDirty).toBe(true)

      // Save
      await editStateResult.handleSave()

      expect(primaryStore.isDirty).toBe(false)
      expect(additionalStore.isDirty).toBe(false)

      // After save, same data should not be dirty
      additionalStore.markDirty()
      expect(additionalStore.isDirty).toBe(false)
    })
  })

  describe('additionalStores: confirmDiscard restores all stores', () => {
    it('restores additional store to pre-change state', async () => {
      const tupleStore = createTupleStore()

      const { primaryStore, editStateResult } = await mountWithEditState({
        primaryData: { name: 'Test' },
        additionalStores: [
          {
            store: tupleStore,
            originalData: () =>
              tupleStore.formId.value
                ? [
                    { ...tupleStore.config.value },
                    [...tupleStore.products.value],
                    tupleStore.formId.value
                  ]
                : undefined
          }
        ]
      })

      // Mutate additional store
      tupleStore.config.value = { version: '2.0', amounts: { single: 50 } }
      tupleStore.markDirty()
      primaryStore.markDirty()
      expect(primaryStore.isDirty).toBe(true)

      // Discard
      await editStateResult.confirmDiscard()
      await nextTick()

      // Tuple store should have been re-initialized
      expect(tupleStore.initCalls.length).toBeGreaterThan(0)
      const lastCall = tupleStore.initCalls[tupleStore.initCalls.length - 1]!
      // Should restore the original config
      expect((lastCall[0] as Record<string, unknown>).version).toBe('1.0')
      expect(lastCall[2]).toBe('form-1')
    })
  })

  describe('additionalStores: tuple initializer (array spread)', () => {
    it('calls initialize with spread args for array snapshots', async () => {
      const tupleStore = createTupleStore()

      const { editStateResult, primaryStore } = await mountWithEditState({
        primaryData: { name: 'Test' },
        additionalStores: [
          {
            store: tupleStore,
            originalData: () => [
              { ...tupleStore.config.value },
              [...tupleStore.products.value],
              tupleStore.formId.value
            ]
          }
        ]
      })

      // Mutate and discard
      tupleStore.config.value.version = '3.0'
      tupleStore.markDirty()
      primaryStore.markDirty()

      await editStateResult.confirmDiscard()
      await nextTick()

      // Check that initialize was called with 3 args (spread), not 1 array
      const lastCall = tupleStore.initCalls[tupleStore.initCalls.length - 1]!
      expect(lastCall.length).toBe(3)
    })
  })

  describe('shared-reference safety: discard after in-place mutation', () => {
    it('restores data even when Object.assign mutated store in-place', async () => {
      // This test catches the real bug: setData uses Object.assign to mutate store
      // data in-place. If the store shares references with the source data,
      // discard can't restore because the source is also corrupted.
      const additionalStore = createMockStore({ presets: [5, 10, 25] })
      const additionalData = ref({ presets: [5, 10, 25] })

      const { primaryStore, editStateResult } = await mountWithEditState({
        primaryData: { name: 'Test' },
        additionalStores: [
          {
            store: additionalStore,
            originalData: () => ({ ...additionalData.value })
          }
        ]
      })

      // Simulate Object.assign mutation (like CampaignMasterConfigPanel setData)
      Object.assign(additionalStore.data, { presets: [51, 10, 25] })
      additionalData.value = { presets: [51, 10, 25] }
      additionalStore.markDirty()
      expect(primaryStore.isDirty).toBe(true)

      // Discard — must restore original values
      await editStateResult.confirmDiscard()
      await nextTick()

      expect(additionalStore.data.presets).toEqual([5, 10, 25])
      expect(primaryStore.isDirty).toBe(false)
      expect(additionalStore.isDirty).toBe(false)
    })

})
})
