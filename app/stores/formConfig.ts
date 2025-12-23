import { defineStore } from 'pinia'
import type {
  FormSettings,
  LocalizationSettings,
  PricingSettings
} from '~/features/donation-form/types'
import type { ImpactCartSettings } from '~/features/donation-form/impact-cart/types'
import type { ProductSelectorSettings } from '~/features/donation-form/product-selector/types'
import type { RewardsSettings } from '~/features/donation-form/rewards/types'
import type { CoverCostsSettings } from '~/features/donation-form/cover-costs/types'
import type { TributeSettings } from '~/features/donation-form/tribute/types'
import type { Product } from '~/features/donation-form/product/types'

/**
 * Form configuration store (Pinia)
 *
 * Flat structure optimized for UI binding - each section is independently reactive.
 * Types are decomposed by feature for maintainability.
 *
 * @example
 * ```vue
 * <script setup>
 * const store = useFormConfigStore()
 * </script>
 *
 * <template>
 *   <FormRenderer v-model="store.coverCosts" :section="coverCostsSection" />
 * </template>
 * ```
 */
export const useFormConfigStore = defineStore('formConfig', {
  state: () => ({
    // Metadata
    version: '1.0',

    // Core donation form settings
    form: null as FormSettings | null,
    localization: null as LocalizationSettings | null,
    pricing: null as PricingSettings | null,

    // Feature settings (flat for direct v-model binding)
    impactCart: null as ImpactCartSettings | null,
    productSelector: null as ProductSelectorSettings | null,
    rewards: null as RewardsSettings | null,
    coverCosts: null as CoverCostsSettings | null,
    tribute: null as TributeSettings | null,

    // Products (separate concern)
    products: [] as Product[]
  }),

  getters: {
    /**
     * Reconstruct full API-compatible config object
     * Use this when you need to serialize the entire config (e.g., for API submission)
     */
    fullConfig(state): FullFormConfig | null {
      if (!state.form || !state.localization || !state.pricing) {
        return null
      }

      return {
        version: state.version,
        form: state.form,
        localization: state.localization,
        pricing: state.pricing,
        features: {
          impactCart: state.impactCart!,
          productSelector: state.productSelector!,
          rewards: state.rewards!,
          coverCosts: state.coverCosts!,
          tribute: state.tribute!
        }
      }
    }
  },

  actions: {
    /**
     * Initialize store from API response
     * Destructures nested config into flat store structure
     */
    initialize(config: FullFormConfig, productList: Product[]) {
      this.version = config.version
      this.form = config.form
      this.localization = config.localization
      this.pricing = config.pricing
      this.impactCart = config.features.impactCart
      this.productSelector = config.features.productSelector
      this.rewards = config.features.rewards
      this.coverCosts = config.features.coverCosts
      this.tribute = config.features.tribute
      this.products = productList
    }
  }
})

/**
 * Full form configuration type (API response shape)
 * Composed from individual feature types
 */
export interface FullFormConfig {
  version: string
  form: FormSettings
  localization: LocalizationSettings
  pricing: PricingSettings
  features: {
    impactCart: ImpactCartSettings
    productSelector: ProductSelectorSettings
    rewards: RewardsSettings
    coverCosts: CoverCostsSettings
    tribute: TributeSettings
  }
}
