import { defineStore } from 'pinia'
import type {
  FormSettings,
  LocalizationSettings,
  PricingSettings,
  DonationCustomFieldsSettings
} from '~/features/donation-form/shared/types'
import type { ImpactCartSettings } from '~/features/donation-form/features/impact-cart/shared/types'
import type { ProductSelectorSettings } from '~/features/donation-form/features/product-selector/shared/types'
import type { ImpactJourneySettings } from '~/features/donation-form/features/impact-journey/shared/types'
import type { CoverCostsSettings } from '~/features/donation-form/features/cover-costs/shared/types'
import type { GiftAidSettings } from '~/features/donation-form/features/gift-aid/shared/types'
import type { TributeSettings } from '~/features/donation-form/features/tribute/shared/types'
import type { Product } from '~/features/donation-form/features/product/shared/types'

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

    // Core donation form settings (combined for direct v-model binding)
    formSettings: null as FormSettingsCombined | null,

    // Feature settings (flat for direct v-model binding)
    impactCart: null as ImpactCartSettings | null,
    productSelector: null as ProductSelectorSettings | null,
    impactJourney: null as ImpactJourneySettings | null,
    coverCosts: null as CoverCostsSettings | null,
    giftAid: null as GiftAidSettings | null,
    tribute: null as TributeSettings | null,
    customFields: null as DonationCustomFieldsSettings | null,

    // Products (separate concern)
    products: [] as Product[]
  }),

  getters: {
    /**
     * Reconstruct full API-compatible config object
     * Use this when you need to serialize the entire config (e.g., for API submission)
     */
    fullConfig(state): FullFormConfig | null {
      if (!state.formSettings) {
        return null
      }

      return {
        version: state.version,
        form: state.formSettings.form,
        localization: state.formSettings.localization,
        pricing: state.formSettings.pricing,
        features: {
          impactCart: state.impactCart!,
          productSelector: state.productSelector!,
          impactJourney: state.impactJourney!,
          coverCosts: state.coverCosts!,
          giftAid: state.giftAid!,
          tribute: state.tribute!,
          customFields: state.customFields!
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
      this.formSettings = {
        form: config.form,
        localization: config.localization,
        pricing: config.pricing
      }
      this.impactCart = config.features.impactCart
      this.productSelector = config.features.productSelector
      this.impactJourney = config.features.impactJourney
      this.coverCosts = config.features.coverCosts
      this.giftAid = config.features.giftAid
      this.tribute = config.features.tribute
      this.customFields = config.features.customFields
      this.products = productList
    }
  }
})

/**
 * Combined form settings type for v-model binding
 * Matches the structure expected by createFormConfigSection()
 */
export interface FormSettingsCombined {
  form: FormSettings
  localization: LocalizationSettings
  pricing: PricingSettings
}

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
    impactJourney: ImpactJourneySettings
    coverCosts: CoverCostsSettings
    giftAid: GiftAidSettings
    tribute: TributeSettings
    customFields: DonationCustomFieldsSettings
  }
}
