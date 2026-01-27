import { ref } from 'vue'

/**
 * Shared editable store state and methods
 * Used by all admin stores to track dirty/saving state
 *
 * @example
 * ```ts
 * export const useMyStore = defineStore('myStore', () => {
 *   const { isDirty, isSaving, markDirty, markClean } = useEditableState()
 *
 *   const data = ref('...')
 *
 *   function updateData(newData: string) {
 *     data.value = newData
 *     markDirty()
 *   }
 *
 *   function initialize(initialData: string) {
 *     data.value = initialData
 *     markClean()
 *   }
 *
 *   return {
 *     data,
 *     isDirty,
 *     isSaving,
 *     markDirty,
 *     markClean,
 *     initialize,
 *     updateData
 *   }
 * })
 * ```
 */
export function useEditableState() {
  const isDirty = ref(false)
  const isSaving = ref(false)

  function markDirty() {
    isDirty.value = true
  }

  function markClean() {
    isDirty.value = false
  }

  return {
    isDirty,
    isSaving,
    markDirty,
    markClean
  }
}
