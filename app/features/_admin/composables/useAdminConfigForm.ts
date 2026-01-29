import { ref, computed } from 'vue'
import type { ComposableForm } from '~/features/_library/form-builder/types'
import type { EditableStore } from './useAdminEdit'
import {
  generateStoreMapping,
  generateGetData,
  generateSetData
} from '~/features/_library/form-builder/utils/storeMapping'

/**
 * Configuration for useAdminConfigForm composable
 */
export interface AdminConfigFormOptions<TStore extends EditableStore, TData> {
  /** Store instance with isDirty, isSaving state */
  store: TStore
  /** Form definition from defineForm */
  form: ComposableForm

  // OPTION 1: Auto-mapping (NEW - default)
  /** Enable automatic store mapping based on form structure (default: true) */
  autoMap?: boolean

  // OPTION 2: Manual mapping (backward compatible)
  /** Function to extract data from store for v-model binding */
  getData?: (store: TStore) => TData
  /** Function to update store when data changes */
  setData?: (store: TStore, data: TData) => void

  /** Optional context schema for FormRenderer */
  contextSchema?: Record<string, unknown>
}

/**
 * Composable to eliminate boilerplate in admin config components
 * Handles FormRenderer binding, validation state, and emit/expose patterns
 *
 * Now supports auto-mapping via form metadata - no getData/setData needed!
 *
 * @example Auto-mapping (new default):
 * ```vue
 * <script setup lang="ts">
 * const store = useCampaignConfigStore()
 *
 * // AUTO-MAPPING: No getData/setData needed! ✨
 * const { formRef, modelValue, expose } = useAdminConfigForm({
 *   store,
 *   form: createCampaignConfigMaster()
 * })
 * </script>
 * ```
 *
 * @example Manual mapping (backward compatible):
 * ```vue
 * <script setup lang="ts">
 * const store = useCurrencySettingsStore()
 *
 * const { formRef, modelValue, expose } = useAdminConfigForm({
 *   store,
 *   form: useCurrencySettingsForm,
 *   autoMap: false,
 *   getData: (s) => ({ currencies: { supportedCurrencies: s.supportedCurrencies } }),
 *   setData: (s, v) => s.updateSettings(v.currencies)
 * })
 * </script>
 * ```
 */
export function useAdminConfigForm<
  TStore extends EditableStore,
  TData extends Record<string, unknown>
>({
  store,
  form,
  autoMap = true,
  getData: manualGetData,
  setData: manualSetData,
  contextSchema
}: AdminConfigFormOptions<TStore, TData>) {
  // Form ref for validation
  const formRef = ref()

  // Determine which mapping to use
  let getData: (store: TStore) => TData
  let setData: (store: TStore, data: TData) => void

  if (autoMap && !manualGetData && !manualSetData) {
    // AUTO-MAPPING: Generate functions from form metadata
    const mapping = generateStoreMapping(form)
    getData = generateGetData<TStore>(mapping) as (store: TStore) => TData
    setData = generateSetData<TStore>(mapping) as (store: TStore, data: TData) => void
  } else if (manualGetData && manualSetData) {
    // MANUAL MAPPING: Use provided functions
    getData = manualGetData
    setData = manualSetData
  } else {
    throw new Error('useAdminConfigForm: Must provide either autoMap=true OR both getData/setData')
  }

  // Two-way binding for FormRenderer
  const modelValue = computed({
    get: () => getData(store),
    set: (value) => setData(store, value)
  })

  // Standard expose interface for admin config components
  const expose = {
    isValid: computed(() => formRef.value?.isValid ?? false),
    /**
     * Reset form to current store values without remounting
     * Useful for discard functionality - resets validation state
     */
    resetToSaved: () => {
      if (formRef.value?.resetToValues) {
        formRef.value.resetToValues(getData(store))
      }
    }
  }

  return {
    formRef,
    modelValue,
    form,
    contextSchema,
    // For defineExpose()
    expose
  }
}
