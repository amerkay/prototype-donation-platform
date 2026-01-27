import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type {
  FormSettings,
  PricingSettings,
  DonationCustomFieldsSettings
} from '~/features/donation-form/shared/types'
import type { ImpactCartSettings } from '~/features/donation-form/features/impact-cart/admin/types'
import type { ProductSelectorSettings } from '~/features/donation-form/features/product-selector/admin/types'
import type { ImpactJourneySettings } from '~/features/donation-form/features/impact-journey/admin/types'
import type { CoverCostsSettings } from '~/features/donation-form/features/cover-costs/admin/types'
import type { GiftAidSettings } from '~/features/donation-form/features/gift-aid/admin/types'
import type { TributeSettings } from '~/features/donation-form/features/tribute/admin/types'
import type { Product } from '~/features/donation-form/features/product/shared/types'
import { useEditableState } from '~/features/_admin/composables/defineEditableStore'

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
export const useFormConfigStore = defineStore('formConfig', () => {
  // Editable state management
  const { isDirty, isSaving, markDirty, markClean } = useEditableState()

  // State
  const formId = ref<string | null>(null)
  const version = ref('1.0')
  const formSettings = ref<FormSettingsCombined | null>(null)
  const impactCart = ref<ImpactCartSettings | null>(null)
  const productSelector = ref<ProductSelectorSettings | null>(null)
  const impactJourney = ref<ImpactJourneySettings | null>(null)
  const coverCosts = ref<CoverCostsSettings | null>(null)
  const giftAid = ref<GiftAidSettings | null>(null)
  const tribute = ref<TributeSettings | null>(null)
  const customFields = ref<DonationCustomFieldsSettings | null>(null)
  const products = ref<Product[]>([])

  // Getters
  const fullConfig = computed((): FullFormConfig | null => {
    if (!formSettings.value) {
      return null
    }

    return {
      version: version.value,
      form: formSettings.value.form,
      pricing: formSettings.value.pricing,
      features: {
        impactCart: impactCart.value!,
        productSelector: productSelector.value!,
        impactJourney: impactJourney.value!,
        coverCosts: coverCosts.value!,
        giftAid: giftAid.value!,
        tribute: tribute.value!,
        customFields: customFields.value!
      }
    }
  })

  // Actions
  function initialize(config: FullFormConfig, productList: Product[], id?: string) {
    formId.value = id ?? null
    version.value = config.version
    formSettings.value = {
      form: config.form,
      pricing: config.pricing
    }
    impactCart.value = config.features.impactCart
    productSelector.value = config.features.productSelector
    impactJourney.value = config.features.impactJourney
    coverCosts.value = config.features.coverCosts
    giftAid.value = config.features.giftAid
    tribute.value = config.features.tribute
    customFields.value = config.features.customFields
    products.value = productList
    markClean()
  }

  return {
    // State
    formId,
    version,
    formSettings,
    impactCart,
    productSelector,
    impactJourney,
    coverCosts,
    giftAid,
    tribute,
    customFields,
    products,
    isDirty,
    isSaving,
    // Getters
    fullConfig,
    // Actions
    initialize,
    markDirty,
    markClean
  }
})

/**
 * Combined form settings type for v-model binding
 */
export interface FormSettingsCombined {
  form: FormSettings
  pricing: PricingSettings
}

/**
 * Full form configuration type (API response shape)
 * Composed from individual feature types
 */
export interface FullFormConfig {
  version: string
  form: FormSettings
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
