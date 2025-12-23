import { reactive, readonly, toRef } from 'vue'
import type { FormConfig, Product } from '@/lib/common/types'

/**
 * Centralized form configuration composable
 *
 * Uses module-level reactive state for immediate availability.
 * State is shared across all components and persists during navigation,
 * but resets on page reload (allowing fresh API data).
 *
 * @example
 * ```ts
 * // Initialize in page/layout
 * const { initializeConfig } = useFormConfig()
 * initializeConfig(loadedConfig, loadedProducts)
 *
 * // Use in any component
 * const { formConfig, products } = useFormConfig()
 * ```
 */

// Module-level reactive state (shared across all components)
const state = reactive<{
  formConfig: FormConfig | null
  products: Product[]
}>({
  formConfig: null,
  products: []
})

export function useFormConfig() {
  /**
   * Initialize or update configuration and products
   */
  function initializeConfig(config: FormConfig, productList: Product[]) {
    state.formConfig = config
    state.products = productList
  }

  /**
   * Update only the form configuration
   */
  function updateConfig(config: FormConfig) {
    state.formConfig = config
  }

  /**
   * Update only the products
   */
  function updateProducts(productList: Product[]) {
    state.products = productList
  }

  // Return readonly refs to prevent external mutation
  return {
    formConfig: toRef(readonly(state), 'formConfig'),
    products: toRef(readonly(state), 'products'),
    initializeConfig,
    updateConfig,
    updateProducts
  }
}
