import type { Ref, ComputedRef } from 'vue'
import { toast } from 'vue-sonner'

/**
 * Generic store interface for admin edit operations
 * Any store used with useAdminEdit must implement these properties/methods
 */
export interface EditableStore {
  isDirty: boolean
  isSaving: boolean
  markDirty: () => void
  markClean: () => void
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  initialize: (...args: any[]) => void
}

/**
 * Options for useAdminEdit composable
 */
export interface UseAdminEditOptions<TStore extends EditableStore, TOriginalData> {
  /** Store instance with isDirty, isSaving, markClean, initialize */
  store: TStore
  /** Ref to form component with isValid property */
  formRef: Ref<{ isValid: boolean } | undefined>
  /** Original data to restore on discard */
  originalData: ComputedRef<TOriginalData | undefined>
  /** Function to call on successful save */
  onSave: () => Promise<void>
  /** Function to restore original data (usually calls store.initialize) */
  onDiscard: (data: TOriginalData) => void
}

/**
 * Composable for managing save/discard logic in admin edit pages
 * Provides consistent validation, save state, and discard confirmation
 *
 * @example
 * ```vue
 * <script setup>
 * const store = useCampaignConfigStore()
 * const formRef = ref()
 * const campaign = computed(() => getCampaignById(id))
 *
 * const {
 *   handleSave,
 *   handleDiscard,
 *   confirmDiscard,
 *   showDiscardDialog,
 *   formKey
 * } = useAdminEdit({
 *   store,
 *   formRef,
 *   originalData: campaign,
 *   onSave: async () => {
 *     await updateCampaign(store.id, store.fullCampaign)
 *   },
 *   onDiscard: (data) => store.initialize(data)
 * })
 * </script>
 * ```
 */
export function useAdminEdit<TStore extends EditableStore, TOriginalData>({
  store,
  formRef,
  originalData,
  onSave,
  onDiscard
}: UseAdminEditOptions<TStore, TOriginalData>) {
  // Discard state
  const showDiscardDialog = ref(false)

  // Form key to force re-render on discard
  const formKey = ref(0)

  /**
   * Handle save action with validation
   */
  const handleSave = async () => {
    // Validate form
    const isValid = formRef.value?.isValid

    if (!isValid) {
      toast.error('Please fix all errors before saving')
      return
    }

    store.isSaving = true

    try {
      await onSave()

      store.markClean()
      toast.success('Settings saved successfully')
    } catch (error) {
      console.error('Save failed:', error)
      toast.error('Failed to save settings. Please try again.')
    } finally {
      store.isSaving = false
    }
  }

  /**
   * Show discard confirmation dialog
   */
  const handleDiscard = () => {
    showDiscardDialog.value = true
  }

  /**
   * Confirm and execute discard action
   */
  const confirmDiscard = () => {
    const data = originalData.value
    if (data) {
      onDiscard(data)
      // Increment formKey to force form re-render with fresh state
      formKey.value++
      toast.success('Changes discarded')
    }
    showDiscardDialog.value = false
  }

  return {
    handleSave,
    handleDiscard,
    confirmDiscard,
    showDiscardDialog,
    formKey
  }
}
