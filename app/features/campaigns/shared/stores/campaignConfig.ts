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

/**
 * Campaign configuration store (Pinia)
 *
 * Flat structure optimized for UI binding - each section is independently reactive.
 * Used by the split-screen campaign editor for live preview updates.
 *
 * @example
 * ```vue
 * <script setup>
 * const store = useCampaignConfigStore()
 * </script>
 *
 * <template>
 *   <FormRenderer v-model="store.crowdfunding" :section="crowdfundingForm" />
 *   <CrowdfundingPagePreview />
 * </template>
 * ```
 */
export const useCampaignConfigStore = defineStore('campaignConfig', () => {
  // Editable state management
  const { isDirty, isSaving, markDirty, markClean } = useEditableState()

  // State
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

  // Getters
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

  /** Total matched amount (sum of poolDrawn across all periods) — represents actual match funds disbursed */
  const matchedTotal = computed((): number => {
    if (!hasMatchedGiving.value || !stats.value) return 0
    return stats.value.totalRaised + totalPoolDrawn.value
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
      form: form.value
    }
  })

  // Actions
  // TODO-SUPABASE: Persistence delegated to useCampaigns().updateCampaign() — no direct DB calls here
  function initialize(campaign: Campaign) {
    id.value = campaign.id
    type.value = campaign.type
    p2pPreset.value = campaign.p2pPreset ?? null
    parentCampaignId.value = campaign.parentCampaignId ?? null
    name.value = campaign.name
    status.value = campaign.status
    isArchived.value = campaign.isArchived ?? false
    stats.value = { ...campaign.stats }
    crowdfunding.value = { ...campaign.crowdfunding }
    peerToPeer.value = { ...campaign.peerToPeer }
    matchedGiving.value = { ...campaign.matchedGiving }
    form.value = campaign.form ? { ...campaign.form } : null
    fundraisers.value = [...campaign.fundraisers]
    recentDonations.value = [...campaign.recentDonations]
    createdAt.value = campaign.createdAt
    updatedAt.value = campaign.updatedAt
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
    markClean()
  }

  return {
    // State
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
    // Getters
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
    // Actions
    initialize,
    reset,
    markDirty,
    markClean
  }
})
