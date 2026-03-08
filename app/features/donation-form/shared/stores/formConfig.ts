import { defineStore } from 'pinia'
import { computed } from 'vue'
import type { FullFormConfig } from '~/features/donation-form/shared/types'
import type { Product } from '~/features/donation-form/features/product/shared/types'
import type { CampaignType } from '~/features/campaigns/shared/types'
import { useCampaignConfigStore } from '~/features/campaigns/shared/stores/campaignConfig'

/**
 * Form configuration store — thin adapter over useCampaignConfigStore().formConfig
 *
 * Since campaigns have a 1:1 relationship with forms, all form config state
 * lives in the campaign store's `formConfig` namespace. This store provides
 * backward-compatible access for existing consumers.
 *
 * @deprecated Import useCampaignConfigStore and access store.formConfig.* directly.
 */
export const useFormConfigStore = defineStore('formConfig', () => {
  const campaignStore = useCampaignConfigStore()
  const fc = campaignStore.formConfig

  // Proxy state — all reads/writes go through campaignStore.formConfig
  const formId = computed({
    get: () => fc.formId,
    set: (v) => {
      fc.formId = v
    }
  })
  const version = computed({
    get: () => fc.version,
    set: (v) => {
      fc.version = v
    }
  })
  const form = computed({
    get: () => fc.form,
    set: (v) => {
      fc.form = v
    }
  })
  const donationAmounts = computed({
    get: () => fc.donationAmounts,
    set: (v) => {
      fc.donationAmounts = v
    }
  })
  const impactCart = computed({
    get: () => fc.impactCart,
    set: (v) => {
      fc.impactCart = v
    }
  })
  const productSelector = computed({
    get: () => fc.productSelector,
    set: (v) => {
      fc.productSelector = v
    }
  })
  const impactBoost = computed({
    get: () => fc.impactBoost,
    set: (v) => {
      fc.impactBoost = v
    }
  })
  const coverCosts = computed({
    get: () => fc.coverCosts,
    set: (v) => {
      fc.coverCosts = v
    }
  })
  const tribute = computed({
    get: () => fc.tribute,
    set: (v) => {
      fc.tribute = v
    }
  })
  const customFields = computed({
    get: () => fc.customFields,
    set: (v) => {
      fc.customFields = v
    }
  })
  const entryFields = computed({
    get: () => fc.entryFields,
    set: (v) => {
      fc.entryFields = v
    }
  })
  const contactConsent = computed({
    get: () => fc.contactConsent,
    set: (v) => {
      fc.contactConsent = v
    }
  })
  const terms = computed({
    get: () => fc.terms,
    set: (v) => {
      fc.terms = v
    }
  })
  /** All products across both features (deduplicated) */
  const products = computed(() => campaignStore.allProducts)

  // Getters
  const fullConfig = computed(() => campaignStore.fullFormConfig)

  // Dirty state proxied from campaign store
  const isDirty = computed(() => campaignStore.isDirty)
  const isSaving = computed(() => campaignStore.isSaving)

  /**
   * Initialize form config via campaign store.
   * Backward-compatible signature: (config, products, id?, campaignType?)
   */
  function initialize(
    config: FullFormConfig,
    productList: Product[],
    id?: string,
    campaignType?: CampaignType
  ) {
    // Build a minimal CampaignForm shape for initializeFormConfig
    // Products are distributed per-feature inside initializeFormConfig
    campaignStore.initializeFormConfig(
      {
        id: id ?? '',
        campaignId: campaignStore.id ?? '',
        name: campaignStore.formConfig.formName || 'Donation Form',
        isDefault: true,
        config,
        products: productList,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      campaignType ?? campaignStore.type
    )
    campaignStore.markClean()
  }

  function toSnapshot(): [FullFormConfig, Product[], string | null] | undefined {
    if (!fullConfig.value || !fc.formId) return undefined
    return JSON.parse(JSON.stringify([fullConfig.value, campaignStore.allProducts, fc.formId]))
  }

  function markDirty() {
    campaignStore.markDirty()
  }

  function markClean() {
    campaignStore.markClean()
  }

  return {
    // State (proxied)
    formId,
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

// Re-export FullFormConfig from canonical location for backward compatibility
export type { FullFormConfig } from '~/features/donation-form/shared/types'
