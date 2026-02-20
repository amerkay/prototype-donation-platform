import { ref, computed, provide, onMounted, onUnmounted, type Ref, type ComputedRef } from 'vue'
import { onBeforeRouteLeave } from 'vue-router'
import { toast } from 'vue-sonner'

/**
 * Deep clone helper that removes Vue reactivity and clones data
 */
function deepClone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value))
}

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
  /** Ref to form component with isValid property and resetToSaved method */
  formRef: Ref<{ isValid: boolean; resetToSaved?: () => void } | undefined>
  /** Original data to restore on discard. Should be reactive to current store state. */
  originalData: ComputedRef<TOriginalData | undefined>
  /** Function to call on successful save */
  onSave: () => Promise<void>
  /** Optional function to restore original data. Defaults to store.initialize(data) */
  onDiscard?: (data: TOriginalData) => void
}

/** Inject key for leave guard state shared with AdminEditLayout */
export const LEAVE_GUARD_KEY = 'adminLeaveGuard'

export type LeaveAction = 'save' | 'discard' | 'stay'

export interface LeaveGuard {
  showDialog: Ref<boolean>
  canSave: ComputedRef<boolean>
  resolve: (action: LeaveAction) => void
}

/**
 * Delete protection result from composable-level business rules.
 * Used by both Card and Header components for consistent protection.
 */
export interface DeleteProtection {
  canDelete: boolean
  reason?: string
}

/**
 * Composable for managing save/discard logic in admin edit pages
 * Provides consistent validation, save state, and discard confirmation
 * Includes navigation guard to prevent losing unsaved changes
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
  // Track last saved state - single source of truth for discard baseline
  const lastSavedData = ref<TOriginalData>()

  // Initialize once on mount, then manage independently
  onMounted(() => {
    if (originalData.value) {
      lastSavedData.value = deepClone(originalData.value)
    }
  })

  // Smart dirty detection: auto-clear isDirty when store returns to last-saved state.
  // Patch markDirty so that setData's explicit call is a no-op when values match saved state.
  const hasChanges = computed(() => {
    if (!lastSavedData.value || !originalData.value) return false
    return JSON.stringify(originalData.value) !== JSON.stringify(lastSavedData.value)
  })

  store.markDirty = () => {
    store.isDirty = hasChanges.value
  }

  // Discard state
  const showDiscardDialog = ref(false)

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

      // Capture current state as new baseline
      // originalData is reactive to store, so it reflects the just-saved state
      if (originalData.value) {
        lastSavedData.value = deepClone(originalData.value)
      }

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
   * Restore store to last saved state (shared by confirmDiscard and leave guard)
   * Deep clones before passing to prevent mutation of lastSavedData
   */
  const restoreLastSaved = () => {
    if (!lastSavedData.value) return
    // Must clone to prevent initialize() from storing references that mutate lastSavedData
    const dataToRestore = deepClone(lastSavedData.value)
    if (onDiscard) {
      onDiscard(dataToRestore)
    } else {
      if (Array.isArray(dataToRestore)) {
        store.initialize(...dataToRestore)
      } else {
        store.initialize(dataToRestore)
      }
    }
    store.markClean()
  }

  /**
   * Confirm and execute discard action
   */
  const confirmDiscard = async () => {
    // Restore to last saved state
    restoreLastSaved()

    // Reset form validation state to match updated store
    // This updates vee-validate's internal state without remounting
    if (formRef.value?.resetToSaved) {
      formRef.value.resetToSaved()
    }

    // Wait for all reactive updates to settle, then mark clean again
    // resetToSaved() triggers FormRenderer watchers which may call setData and mark dirty
    await nextTick()
    store.markClean()

    // FormRenderer's watcher uses { flush: 'post' } which can fire after nextTick
    // Use setTimeout to ensure we mark clean after ALL async updates complete
    setTimeout(() => {
      store.markClean()
    }, 0)

    toast.success('Changes discarded')
    showDiscardDialog.value = false
  }

  /**
   * Patch specific fields in the discard baseline without re-snapshotting the full store.
   * Use after saving fields independently (e.g. name/status) so discard doesn't
   * revert those saved changes while preserving the original baseline for unsaved form edits.
   */
  const patchBaseline = (patch: Record<string, unknown>) => {
    if (lastSavedData.value != null && typeof lastSavedData.value === 'object') {
      Object.assign(lastSavedData.value, deepClone(patch))
    }
  }

  // ── Navigation guard ──────────────────────────────────────────────────
  const showLeaveDialog = ref(false)
  const canSave = computed(() => formRef.value?.isValid ?? false)
  let resolveLeaveAction: ((action: LeaveAction) => void) | null = null

  const leaveGuard: LeaveGuard = {
    showDialog: showLeaveDialog,
    canSave,
    resolve: (action: LeaveAction) => {
      resolveLeaveAction?.(action)
      resolveLeaveAction = null
    }
  }

  provide(LEAVE_GUARD_KEY, leaveGuard)

  onBeforeRouteLeave(async () => {
    if (!store.isDirty) return true

    showLeaveDialog.value = true

    const action = await new Promise<LeaveAction>((resolve) => {
      resolveLeaveAction = resolve
    })

    showLeaveDialog.value = false

    if (action === 'save') {
      await handleSave()
      // Navigate only if save succeeded (isDirty cleared)
      return !store.isDirty
    }

    if (action === 'discard') {
      restoreLastSaved()
      return true
    }

    // 'stay'
    return false
  })

  // Warn on browser close/refresh with unsaved changes
  const handleBeforeUnload = (e: BeforeUnloadEvent) => {
    if (store.isDirty) {
      e.preventDefault()
    }
  }

  onMounted(() => {
    window.addEventListener('beforeunload', handleBeforeUnload)
  })

  onUnmounted(() => {
    window.removeEventListener('beforeunload', handleBeforeUnload)
  })

  return {
    handleSave,
    handleDiscard,
    confirmDiscard,
    showDiscardDialog,
    patchBaseline
  }
}
