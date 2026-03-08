import { defineStore } from 'pinia'
import { reactive, computed, toRefs } from 'vue'
import type {
  FullFormConfig,
  FormSettings,
  DonationAmountsSettings,
  DonationCustomFieldsSettings,
  EntryFieldsSettings
} from '~/features/donation-form/shared/types'
import type { ImpactCartSettings } from '~/features/donation-form/features/impact-cart/admin/types'
import type { ProductSelectorSettings } from '~/features/donation-form/features/product-selector/admin/types'
import type { ImpactBoostSettings } from '~/features/donation-form/features/impact-boost/admin/types'
import type { CoverCostsSettings } from '~/features/donation-form/features/cover-costs/admin/types'
import type { TributeSettings } from '~/features/donation-form/features/tribute/admin/types'
import type { ContactConsentSettings } from '~/features/donation-form/features/contact-consent/admin/types'
import type { Product } from '~/features/donation-form/features/product/shared/types'
import type { CampaignForm, CampaignType } from '~/features/campaigns/shared/types'
import { getCampaignCapabilities } from '~/features/campaigns/shared/utils/campaignCapabilities'
import { useCampaignConfigStore } from '~/features/campaigns/shared/stores/campaignConfig'

/**
 * Default form config state — used for reset and pre-population
 */
export function createDefaultFormConfig() {
  return {
    formId: null as string | null,
    formName: '',
    formIsDefault: true,
    version: '1.0',
    form: null as FormSettings | null,
    donationAmounts: null as DonationAmountsSettings | null,
    impactCart: null as ImpactCartSettings | null,
    productSelector: null as ProductSelectorSettings | null,
    impactBoost: null as ImpactBoostSettings | null,
    coverCosts: null as CoverCostsSettings | null,
    tribute: null as TributeSettings | null,
    customFields: null as DonationCustomFieldsSettings | null,
    entryFields: null as EntryFieldsSettings | null,
    contactConsent: null as ContactConsentSettings | null,
    terms: null as { enabled: boolean } | null
  }
}

/**
 * Form configuration store — owns all donation form config state.
 *
 * State lives here as direct reactive properties. The campaign store
 * exposes this store instance as `formConfig` so that `$storePath`
 * mappings like `'formConfig.donationAmounts'` resolve correctly.
 *
 * Dirty tracking is delegated to the campaign store (the edit-page
 * store of record).
 */
export const useFormConfigStore = defineStore('formConfig', () => {
  // ==================== State ====================
  const state = reactive(createDefaultFormConfig())

  // toRefs creates linked refs — Pinia unwraps them so store.x = y works
  const {
    formId,
    formName,
    formIsDefault,
    version,
    form,
    donationAmounts,
    impactCart,
    productSelector,
    impactBoost,
    coverCosts,
    tribute,
    customFields,
    entryFields,
    contactConsent,
    terms
  } = toRefs(state)

  // ==================== Getters ====================

  /** Assembled FullFormConfig from decomposed state */
  const fullFormConfig = computed((): FullFormConfig | null => {
    if (!state.form || !state.donationAmounts) return null
    return {
      version: state.version,
      form: state.form,
      donationAmounts: state.donationAmounts,
      features: {
        impactCart: state.impactCart!,
        productSelector: state.productSelector!,
        impactBoost: state.impactBoost!,
        coverCosts: state.coverCosts!,
        tribute: state.tribute!,
        customFields: state.customFields!,
        entryFields: state.entryFields!,
        contactConsent: state.contactConsent!,
        terms: state.terms!
      }
    }
  })

  /** All products across both features (deduplicated union) */
  const allProducts = computed((): Product[] => {
    const icProducts = state.impactCart?.products ?? []
    const psProducts = state.productSelector?.products ?? []
    const seen = new Set<string>()
    const result: Product[] = []
    for (const p of [...icProducts, ...psProducts]) {
      if (!seen.has(p.id)) {
        seen.add(p.id)
        result.push(p)
      }
    }
    return result
  })

  /** Reconstructed CampaignForm from state (for saving) */
  const assembledForm = computed((): CampaignForm | null => {
    if (!state.formId || !fullFormConfig.value) return null
    // Lazy import to avoid circular init — campaignConfig imports us
    const campaignStore = useCampaignConfigStore()
    return {
      id: state.formId,
      campaignId: campaignStore.id ?? '',
      name: state.formName,
      isDefault: state.formIsDefault,
      config: fullFormConfig.value,
      products: allProducts.value,
      createdAt: campaignStore.form?.createdAt ?? new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  })

  // Backward-compatible alias
  const fullConfig = fullFormConfig
  const products = allProducts

  // ==================== Dirty delegation ====================
  // Dirty tracking stays on the campaign store (the edit-page store of record).
  // isDirty/isSaving are NOT exposed here — consumers should read them from
  // useCampaignConfigStore() directly. This avoids circular type inference.

  function markDirty() {
    useCampaignConfigStore().markDirty()
  }

  function markClean() {
    useCampaignConfigStore().markClean()
  }

  // ==================== Actions ====================

  /**
   * Initialize form config from a CampaignForm (decompose into flat reactive state).
   * Deep-clones to prevent shared references with source data.
   */
  function initializeFormConfig(campaignForm: CampaignForm | null, campaignType?: CampaignType) {
    if (!campaignForm) {
      Object.assign(state, createDefaultFormConfig())
      return
    }

    // Deep clone to prevent shared references
    const cf = JSON.parse(JSON.stringify(campaignForm)) as CampaignForm
    const config = cf.config

    // Enforce frequency constraints based on campaign type (safety net for P2P)
    if (campaignType && !getCampaignCapabilities(campaignType).allowsRecurring) {
      if (config.donationAmounts?.frequencies?.monthly)
        config.donationAmounts.frequencies.monthly.enabled = false
      if (config.donationAmounts?.frequencies?.yearly)
        config.donationAmounts.frequencies.yearly.enabled = false
    }

    state.formId = cf.id
    state.formName = cf.name
    state.formIsDefault = cf.isDefault
    state.version = config.version
    state.form = config.form
    state.donationAmounts = config.donationAmounts
    // Distribute products into per-feature arrays (independent clones)
    const cloneProducts = () => JSON.parse(JSON.stringify(cf.products ?? [])) as Product[]
    state.impactCart = {
      ...config.features.impactCart,
      products: config.features.impactCart?.products ?? cloneProducts()
    }
    state.productSelector = {
      ...config.features.productSelector,
      products: config.features.productSelector?.products ?? cloneProducts()
    }
    state.impactBoost = config.features.impactBoost
    state.coverCosts = config.features.coverCosts
    state.tribute = config.features.tribute

    // Pre-populate all tab slots so useFieldArray doesn't write [] on mount
    const customFieldsConfig = config.features.customFields ?? { customFieldsTabs: {} }
    const tabs = customFieldsConfig.customFieldsTabs ?? {}
    state.customFields = {
      customFieldsTabs: {
        step2: { enabled: false, fields: [], ...tabs.step2 },
        step3: { enabled: false, fields: [], ...tabs.step3 },
        hidden: { enabled: false, fields: [], ...tabs.hidden }
      }
    }
    state.entryFields = config.features.entryFields ?? {
      enabled: false,
      mode: 'shared',
      fields: []
    }
    state.contactConsent = config.features.contactConsent ?? {
      enabled: true,
      settings: {
        label: 'Join our email list',
        description: 'Get updates on our impact and latest news. Unsubscribe anytime.'
      }
    }
    state.terms = config.features.terms ?? { enabled: true }
  }

  /**
   * Initialize for donor-side callers.
   * Backward-compatible signature: (config, products, id?, campaignType?)
   */
  function initialize(
    config: FullFormConfig,
    productList: Product[],
    id?: string,
    campaignType?: CampaignType
  ) {
    initializeFormConfig(
      {
        id: id ?? '',
        campaignId: useCampaignConfigStore().id ?? '',
        name: state.formName || 'Donation Form',
        isDefault: true,
        config,
        products: productList,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      campaignType ?? useCampaignConfigStore().type
    )
    markClean()
  }

  function toSnapshot(): [FullFormConfig, Product[], string | null] | undefined {
    if (!fullFormConfig.value || !state.formId) return undefined
    return JSON.parse(JSON.stringify([fullFormConfig.value, allProducts.value, state.formId]))
  }

  function reset() {
    Object.assign(state, createDefaultFormConfig())
  }

  return {
    // State
    formId,
    formName,
    formIsDefault,
    version,
    form,
    donationAmounts,
    impactCart,
    productSelector,
    impactBoost,
    coverCosts,
    tribute,
    customFields,
    entryFields,
    contactConsent,
    terms,
    products,
    // Getters
    fullConfig,
    fullFormConfig,
    allProducts,
    assembledForm,
    // Actions
    toSnapshot,
    initialize,
    initializeFormConfig,
    reset,
    markDirty,
    markClean
  }
})

// Re-export FullFormConfig from canonical location for backward compatibility
export type { FullFormConfig } from '~/features/donation-form/shared/types'
