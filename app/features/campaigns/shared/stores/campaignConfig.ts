import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
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
import { useEditableState } from '~/features/_admin/composables/defineEditableStore'
import { getActivePeriod } from '~/features/campaigns/shared/utils/campaignCapabilities'
import { useFormConfigStore } from '~/features/donation-form/shared/stores/formConfig'

/**
 * Campaign configuration store (Pinia)
 *
 * Unified store for campaign + donation form configuration.
 * Campaign fields live at the top level; form config is delegated to
 * useFormConfigStore and exposed as `formConfig` for $storePath compatibility.
 *
 * @example
 * ```vue
 * <script setup>
 * const store = useCampaignConfigStore()
 * // Campaign data
 * store.crowdfunding.title
 * // Form config data (via formConfigStore)
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

  // ==================== Form Config (delegated) ====================
  // Expose formConfigStore directly as `formConfig` — $storePath writes
  // like `store.formConfig.donationAmounts = x` resolve via Pinia reactivity
  const formConfigStore = useFormConfigStore()
  const formConfig = formConfigStore

  // Forward getters for campaign-side consumers
  const fullFormConfig = computed(() => formConfigStore.fullFormConfig)
  const allProducts = computed(() => formConfigStore.allProducts)
  const assembledForm = computed(() => formConfigStore.assembledForm)

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

    // Initialize form config via the form config store
    formConfigStore.initializeFormConfig(c.form, c.type)

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
    formConfigStore.reset()
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
    // Form Config (delegated to formConfigStore)
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
    // Form Config Getters (forwarded)
    fullFormConfig,
    allProducts,
    assembledForm,
    // Actions
    initialize,
    initializeFormConfig: formConfigStore.initializeFormConfig,
    reset,
    markDirty,
    markClean
  }
})
