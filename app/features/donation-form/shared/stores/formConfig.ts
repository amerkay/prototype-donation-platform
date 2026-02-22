import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type {
  FormSettings,
  DonationAmountsSettings,
  DonationCustomFieldsSettings,
  EntryFieldsSettings
} from '~/features/donation-form/shared/types'
import type { ImpactCartSettings } from '~/features/donation-form/features/impact-cart/admin/types'
import type { ProductSelectorSettings } from '~/features/donation-form/features/product-selector/admin/types'
import type { ImpactBoostSettings } from '~/features/donation-form/features/impact-boost/admin/types'
import type { CoverCostsSettings } from '~/features/donation-form/features/cover-costs/admin/types'
import type { GiftAidSettings } from '~/features/donation-form/features/gift-aid/admin/types'
import type { TributeSettings } from '~/features/donation-form/features/tribute/admin/types'
import type { ContactConsentSettings } from '~/features/donation-form/features/contact-consent/admin/types'
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
  const form = ref<FormSettings | null>(null)
  const donationAmounts = ref<DonationAmountsSettings | null>(null)
  const impactCart = ref<ImpactCartSettings | null>(null)
  const productSelector = ref<ProductSelectorSettings | null>(null)
  const impactBoost = ref<ImpactBoostSettings | null>(null)
  const coverCosts = ref<CoverCostsSettings | null>(null)
  const giftAid = ref<GiftAidSettings | null>(null)
  const tribute = ref<TributeSettings | null>(null)
  const customFields = ref<DonationCustomFieldsSettings | null>(null)
  const entryFields = ref<EntryFieldsSettings | null>(null)
  const contactConsent = ref<ContactConsentSettings | null>(null)
  const terms = ref<{ enabled: boolean } | null>(null)
  const products = ref<Product[]>([])

  // Product quantity limits — stored separately so auto-mapping for impactCart doesn't overwrite them
  const quantityRemaining = ref<Record<string, number> | undefined>(undefined)

  // Getters
  const fullConfig = computed((): FullFormConfig | null => {
    if (!form.value || !donationAmounts.value) {
      return null
    }

    // Merge quantityRemaining back into impactCart.settings for serialization
    const ic = impactCart.value!
    const mergedImpactCart: ImpactCartSettings = {
      ...ic,
      settings: { ...ic.settings, quantityRemaining: quantityRemaining.value }
    }

    return {
      version: version.value,
      form: form.value,
      donationAmounts: donationAmounts.value,
      features: {
        impactCart: mergedImpactCart,
        productSelector: productSelector.value!,
        impactBoost: impactBoost.value!,
        coverCosts: coverCosts.value!,
        giftAid: giftAid.value!,
        tribute: tribute.value!,
        customFields: customFields.value!,
        entryFields: entryFields.value!,
        contactConsent: contactConsent.value!,
        terms: terms.value!
      }
    }
  })

  // Actions
  // TODO-SUPABASE: Persistence delegated to useForms().updateForm() — no direct DB calls here
  /**
   * Snapshot current state as a tuple for useAdminEdit comparison.
   * Returns deep cloned data to prevent mutation of lastSavedData.
   */
  function toSnapshot(): [FullFormConfig, Product[], string | null] | undefined {
    if (!fullConfig.value || !formId.value) return undefined
    return JSON.parse(JSON.stringify([fullConfig.value, products.value, formId.value]))
  }

  function initialize(config: FullFormConfig, productList: Product[], id?: string) {
    formId.value = id ?? null
    version.value = config.version
    form.value = config.form
    donationAmounts.value = config.donationAmounts
    impactCart.value = config.features.impactCart
    quantityRemaining.value = config.features.impactCart?.settings?.quantityRemaining
    productSelector.value = config.features.productSelector
    impactBoost.value = config.features.impactBoost
    coverCosts.value = config.features.coverCosts
    giftAid.value = config.features.giftAid
    tribute.value = config.features.tribute
    // Pre-populate all tab slots so useFieldArray doesn't write [] on mount and false-trigger dirty
    const cf = config.features.customFields ?? { customFieldsTabs: {} }
    const tabs = cf.customFieldsTabs ?? {}
    customFields.value = {
      customFieldsTabs: {
        step2: { enabled: false, fields: [], ...tabs.step2 },
        step3: { enabled: false, fields: [], ...tabs.step3 },
        hidden: { enabled: false, fields: [], ...tabs.hidden }
      }
    }
    entryFields.value = config.features.entryFields ?? {
      enabled: false,
      mode: 'shared',
      fields: []
    }
    contactConsent.value = config.features.contactConsent ?? {
      enabled: true,
      settings: {
        label: 'Join our email list',
        description: 'Get updates on our impact and latest news. Unsubscribe anytime.'
      }
    }
    terms.value = config.features.terms ?? { enabled: true }
    products.value = productList
    markClean()
  }

  return {
    // State
    formId,
    version,
    form,
    donationAmounts,
    impactCart,
    productSelector,
    impactBoost,
    coverCosts,
    giftAid,
    tribute,
    customFields,
    entryFields,
    contactConsent,
    terms,
    products,
    quantityRemaining,
    isDirty,
    isSaving,
    // Getters
    fullConfig,
    // Actions
    toSnapshot,
    initialize,
    markDirty,
    markClean
  }
})

/**
 * Full form configuration type (API response shape)
 * Composed from individual feature types
 */
export interface FullFormConfig {
  version: string
  form: FormSettings
  donationAmounts: DonationAmountsSettings
  features: {
    impactCart: ImpactCartSettings
    productSelector: ProductSelectorSettings
    impactBoost: ImpactBoostSettings
    coverCosts: CoverCostsSettings
    giftAid: GiftAidSettings
    tribute: TributeSettings
    customFields: DonationCustomFieldsSettings
    entryFields: EntryFieldsSettings
    contactConsent: ContactConsentSettings
    terms: { enabled: boolean }
  }
}
