import { defineStore } from 'pinia'
import { reactive, toRefs } from 'vue'
import { useEditableState } from '~/features/_admin/composables/defineEditableStore'

/**
 * Generic settings store factory — eliminates boilerplate for simple stores
 * that follow the pattern: defaults → hydrate → edit → save.
 *
 * Returns a Pinia store with reactive state refs, isDirty/isSaving tracking,
 * and sessionStorage persistence (TODO-SUPABASE: replace with Supabase client).
 *
 * For stores with custom action methods (billing, payments) or complex logic
 * (charity tabs, formConfig), use manual defineStore instead.
 */
export function defineSettingsStore<T extends object>(
  id: string,
  options: { defaults: T; storageKey: string }
) {
  return defineStore(id, () => {
    const { isDirty, isSaving, markDirty, markClean } = useEditableState()
    const state = reactive<T>({ ...options.defaults })

    function initialize(settings: T) {
      Object.assign(state, settings)
      markClean()
    }

    function updateSettings(partial: Partial<T>) {
      Object.assign(state, partial)
      markDirty()
    }

    function toSnapshot(): T {
      return JSON.parse(JSON.stringify(state))
    }

    let hydrated = false
    function $hydrate() {
      if (hydrated) return
      try {
        // TODO-SUPABASE: Replace with supabase.from(table).select(column).eq('organization_id', orgId).single()
        const saved = sessionStorage.getItem(options.storageKey)
        if (saved) initialize(JSON.parse(saved))
      } catch {
        /* ignore */
      }
      hydrated = true
    }

    function save() {
      try {
        // TODO-SUPABASE: Replace with supabase.from(table).update({ [column]: toSnapshot() }).eq('organization_id', orgId)
        sessionStorage.setItem(options.storageKey, JSON.stringify(state))
      } catch {
        /* ignore */
      }
    }

    if (import.meta.client) $hydrate()

    return {
      ...toRefs(state),
      isDirty,
      isSaving,
      initialize,
      updateSettings,
      toSnapshot,
      markDirty,
      markClean,
      $hydrate,
      save
    }
  })
}
