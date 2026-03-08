import { defineStore } from 'pinia'
import { ref, reactive, computed } from 'vue'
import type {
  Campaign,
  CampaignType,
  P2PPreset,
  CampaignStats,
  CrowdfundingSettings,
  PeerToPeerSettings,
  MatchedGivingSettings,
  MatchPeriod,
  CampaignDonation,
  CampaignFundraiser,
  CampaignForm,
  CampaignStatus
} from '~/features/campaigns/shared/types'
import type {
  FormSettings,
  DonationAmountsSettings,
  DonationCustomFieldsSettings,
  EntryFieldsSettings,
  FullFormConfig
} from '~/features/donation-form/shared/types'
import type { ImpactCartSettings } from '~/features/donation-form/features/impact-cart/admin/types'
import type { ProductSelectorSettings } from '~/features/donation-form/features/product-selector/admin/types'
import type { ImpactBoostSettings } from '~/features/donation-form/features/impact-boost/admin/types'
import type { CoverCostsSettings } from '~/features/donation-form/features/cover-costs/admin/types'
import type { TributeSettings } from '~/features/donation-form/features/tribute/admin/types'
import type { ContactConsentSettings } from '~/features/donation-form/features/contact-consent/admin/types'
import type { Product } from '~/features/donation-form/features/product/shared/types'
import { useEditableState } from '~/features/_admin/composables/defineEditableStore'
import {
  getActivePeriod,
  getCampaignCapabilities
} from '~/features/campaigns/shared/utils/campaignCapabilities'

/**
 * Default form config state — used for reset and pre-population
 */
function createDefaultFormConfig() {
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
 * Campaign configuration store (Pinia)
 *
 * Unified store for campaign + donation form configuration.
 * Campaign fields live at the top level; form config lives under `formConfig.*`.
 * Used by the split-screen campaign editor for live preview updates.
 *
 * @example
 * ```vue
 * <script setup>
 * const store = useCampaignConfigStore()
 * // Campaign data
 * store.crowdfunding.title
 * // Form config data
 * store.formConfig.donationAmounts
 * store.allProducts (union of impactCart + productSelector products)
 * </script>
 * ```
 */
export const useCampaignConfigStore = defineStore('campaignConfig', () => {
  // Editable state management
  const { isDirty, isSaving, markDirty, markClean } = useEditableState()

  // ==================== Campaign State ====================
  const id = ref<string | null>(null)
  const type = ref<CampaignType>('standard')
  const p2pPreset = ref<P2PPreset | null>(null)
  const parentCampaignId = ref<string | null>(null)
  const name = ref('')
  const status = ref<CampaignStatus>('draft')
  const isArchived = ref(false)
  const stats = ref<CampaignStats | null>(null)
  const crowdfunding = ref<CrowdfundingSettings | null>(null)
  const peerToPeer = ref<PeerToPeerSettings | null>(null)
  const matchedGiving = ref<MatchedGivingSettings>({ periods: [] })
  const form = ref<CampaignForm | null>(null)
  const fundraisers = ref<CampaignFundraiser[]>([])
  const recentDonations = ref<CampaignDonation[]>([])
  const createdAt = ref('')
  const updatedAt = ref('')

  // ==================== Form Config State ====================
  // Reactive namespace for donation form configuration (decomposed from CampaignForm.config)
  const formConfig = reactive(createDefaultFormConfig())

  // ==================== Campaign Getters ====================
  const isP2P = computed(() => type.value === 'p2p')
  const isFundraiser = computed(() => type.value === 'p2p-fundraiser')
  const isEvent = computed(() => type.value === 'event')

  /** Whether this campaign has matched giving enabled (periods exist) */
  const hasMatchedGiving = computed(() => matchedGiving.value.periods.length > 0)

  /** Currently active match period (first with status 'active'), or null */
  const activePeriod = computed((): MatchPeriod | null => {
    if (!hasMatchedGiving.value) return null
    return getActivePeriod(matchedGiving.value.periods)
  })

  /** Total pool committed across all match periods */
  const totalPoolCommitted = computed((): number =>
    matchedGiving.value.periods.reduce((sum, p) => sum + p.poolAmount, 0)
  )

  /** Total pool drawn across all match periods */
  const totalPoolDrawn = computed((): number =>
    matchedGiving.value.periods.reduce((sum, p) => sum + p.poolDrawn, 0)
  )

  /** Total impact = raised + matched (from campaign's own transaction data) */
  const matchedTotal = computed((): number => {
    if (!hasMatchedGiving.value || !stats.value) return 0
    return stats.value.totalRaised + stats.value.totalMatched
  })

  /** Campaign currency (from crowdfunding settings, immutable after creation) */
  const currency = computed({
    get: () => crowdfunding.value?.currency ?? '',
    set: (val: string) => {
      if (!crowdfunding.value) return
      // Currency is immutable after creation — only allow during initialization or new campaigns
      if (id.value && crowdfunding.value.currency) return
      crowdfunding.value.currency = val
    }
  })

  const progressPercentage = computed((): number => {
    if (!crowdfunding.value?.goalAmount || crowdfunding.value.goalAmount === 0) return 0
    return Math.min((stats.value!.totalRaised / crowdfunding.value.goalAmount) * 100, 100)
  })

  const remainingAmount = computed((): number => {
    if (!crowdfunding.value?.goalAmount) return 0
    return Math.max(crowdfunding.value.goalAmount - stats.value!.totalRaised, 0)
  })

  const donationsByRecent = computed((): CampaignDonation[] => {
    return [...recentDonations.value].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )
  })

  const donationsByAmount = computed((): CampaignDonation[] => {
    return [...recentDonations.value].sort((a, b) => b.amount - a.amount)
  })

  const displayDonations = computed((): CampaignDonation[] => {
    const view = crowdfunding.value?.defaultDonationsView || 'recent'
    const limit = crowdfunding.value?.numberOfDonationsToShow || 10
    const sorted =
      view === 'top'
        ? [...recentDonations.value].sort((a, b) => b.amount - a.amount)
        : [...recentDonations.value].sort(
            (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          )
    return sorted.slice(0, limit)
  })

  // ==================== Form Config Getters ====================

  /** Assembled FullFormConfig from decomposed formConfig state */
  const fullFormConfig = computed((): FullFormConfig | null => {
    if (!formConfig.form || !formConfig.donationAmounts) {
      return null
    }

    return {
      version: formConfig.version,
      form: formConfig.form,
      donationAmounts: formConfig.donationAmounts,
      features: {
        impactCart: formConfig.impactCart!,
        productSelector: formConfig.productSelector!,
        impactBoost: formConfig.impactBoost!,
        coverCosts: formConfig.coverCosts!,
        tribute: formConfig.tribute!,
        customFields: formConfig.customFields!,
        entryFields: formConfig.entryFields!,
        contactConsent: formConfig.contactConsent!,
        terms: formConfig.terms!
      }
    }
  })

  /** All products across both features (deduplicated union) */
  const allProducts = computed((): Product[] => {
    const icProducts = formConfig.impactCart?.products ?? []
    const psProducts = formConfig.productSelector?.products ?? []
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

  /** Reconstructed CampaignForm from formConfig state (for saving) */
  const assembledForm = computed((): CampaignForm | null => {
    if (!formConfig.formId || !fullFormConfig.value) return null
    return {
      id: formConfig.formId,
      campaignId: id.value ?? '',
      name: formConfig.formName,
      isDefault: formConfig.formIsDefault,
      config: fullFormConfig.value,
      products: allProducts.value,
      createdAt: form.value?.createdAt ?? new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  })

  // ==================== Combined Getters ====================

  const fullCampaign = computed((): Campaign | null => {
    if (!id.value || !stats.value || !crowdfunding.value || !peerToPeer.value) {
      return null
    }

    return {
      id: id.value,
      type: type.value,
      ...(p2pPreset.value ? { p2pPreset: p2pPreset.value } : {}),
      ...(parentCampaignId.value ? { parentCampaignId: parentCampaignId.value } : {}),
      name: name.value,
      status: status.value,
      isArchived: isArchived.value,
      createdAt: createdAt.value,
      updatedAt: updatedAt.value,
      stats: stats.value,
      crowdfunding: crowdfunding.value,
      peerToPeer: peerToPeer.value,
      matchedGiving: matchedGiving.value,
      fundraisers: fundraisers.value,
      recentDonations: recentDonations.value,
      form: assembledForm.value ?? form.value
    }
  })

  // ==================== Actions ====================
  // TODO-SUPABASE: Persistence delegated to useCampaigns().updateCampaign() — no direct DB calls here

  /**
   * Initialize form config from a CampaignForm (decompose into flat reactive state).
   * Deep-clones to prevent shared references with source data.
   */
  function initializeFormConfig(campaignForm: CampaignForm | null, campaignType?: CampaignType) {
    if (!campaignForm) {
      // Reset form config to defaults
      Object.assign(formConfig, createDefaultFormConfig())
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

    formConfig.formId = cf.id
    formConfig.formName = cf.name
    formConfig.formIsDefault = cf.isDefault
    formConfig.version = config.version
    formConfig.form = config.form
    formConfig.donationAmounts = config.donationAmounts
    // Distribute products into per-feature arrays (independent clones)
    // Legacy data has products at form level; new data has them per-feature
    const cloneProducts = () => JSON.parse(JSON.stringify(cf.products ?? [])) as Product[]
    formConfig.impactCart = {
      ...config.features.impactCart,
      products: config.features.impactCart?.products ?? cloneProducts()
    }
    formConfig.productSelector = {
      ...config.features.productSelector,
      products: config.features.productSelector?.products ?? cloneProducts()
    }
    formConfig.impactBoost = config.features.impactBoost
    formConfig.coverCosts = config.features.coverCosts
    formConfig.tribute = config.features.tribute

    // Pre-populate all tab slots so useFieldArray doesn't write [] on mount and false-trigger dirty
    const customFieldsConfig = config.features.customFields ?? { customFieldsTabs: {} }
    const tabs = customFieldsConfig.customFieldsTabs ?? {}
    formConfig.customFields = {
      customFieldsTabs: {
        step2: { enabled: false, fields: [], ...tabs.step2 },
        step3: { enabled: false, fields: [], ...tabs.step3 },
        hidden: { enabled: false, fields: [], ...tabs.hidden }
      }
    }
    formConfig.entryFields = config.features.entryFields ?? {
      enabled: false,
      mode: 'shared',
      fields: []
    }
    formConfig.contactConsent = config.features.contactConsent ?? {
      enabled: true,
      settings: {
        label: 'Join our email list',
        description: 'Get updates on our impact and latest news. Unsubscribe anytime.'
      }
    }
    formConfig.terms = config.features.terms ?? { enabled: true }
  }

  function initialize(campaign: Campaign) {
    // Deep clone to prevent shared references with source data (useCampaigns).
    const c = JSON.parse(JSON.stringify(campaign)) as Campaign

    id.value = c.id
    type.value = c.type
    p2pPreset.value = c.p2pPreset ?? null
    parentCampaignId.value = c.parentCampaignId ?? null
    name.value = c.name
    status.value = c.status
    isArchived.value = c.isArchived ?? false
    stats.value = c.stats
    crowdfunding.value = c.crowdfunding
    peerToPeer.value = c.peerToPeer
    matchedGiving.value = c.matchedGiving
    form.value = c.form ?? null
    fundraisers.value = c.fundraisers
    recentDonations.value = c.recentDonations
    createdAt.value = c.createdAt
    updatedAt.value = c.updatedAt

    // Initialize form config from the campaign's embedded form
    initializeFormConfig(c.form, c.type)

    markClean()
  }

  function reset() {
    id.value = null
    type.value = 'standard'
    p2pPreset.value = null
    parentCampaignId.value = null
    name.value = ''
    status.value = 'draft'
    isArchived.value = false
    stats.value = null
    crowdfunding.value = null
    peerToPeer.value = null
    matchedGiving.value = { periods: [] }
    form.value = null
    fundraisers.value = []
    recentDonations.value = []
    createdAt.value = ''
    updatedAt.value = ''
    Object.assign(formConfig, createDefaultFormConfig())
    markClean()
  }

  return {
    // Campaign State
    id,
    type,
    p2pPreset,
    parentCampaignId,
    name,
    status,
    isArchived,
    stats,
    crowdfunding,
    peerToPeer,
    matchedGiving,
    form,
    fundraisers,
    recentDonations,
    createdAt,
    updatedAt,
    isDirty,
    isSaving,
    // Form Config State (reactive namespace)
    formConfig,
    // Campaign Getters
    currency,
    isP2P,
    isFundraiser,
    hasMatchedGiving,
    isEvent,
    activePeriod,
    totalPoolCommitted,
    totalPoolDrawn,
    matchedTotal,
    progressPercentage,
    remainingAmount,
    donationsByRecent,
    donationsByAmount,
    displayDonations,
    fullCampaign,
    // Form Config Getters
    fullFormConfig,
    allProducts,
    assembledForm,
    // Actions
    initialize,
    initializeFormConfig,
    reset,
    markDirty,
    markClean
  }
})
