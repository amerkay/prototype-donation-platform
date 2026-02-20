import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type {
  Campaign,
  CampaignType,
  P2PPreset,
  CampaignStats,
  CrowdfundingSettings,
  PeerToPeerSettings,
  CampaignDonation,
  CampaignFundraiser,
  CampaignStatus
} from '~/features/campaigns/shared/types'
import { useEditableState } from '~/features/_admin/composables/defineEditableStore'
import { useFormsStore } from '~/features/campaigns/shared/stores/forms'

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
  const stats = ref<CampaignStats | null>(null)
  const crowdfunding = ref<CrowdfundingSettings | null>(null)
  const peerToPeer = ref<PeerToPeerSettings | null>(null)
  const fundraisers = ref<CampaignFundraiser[]>([])
  const recentDonations = ref<CampaignDonation[]>([])
  const createdAt = ref('')
  const updatedAt = ref('')
  const pendingFormDeletes = ref<Set<string>>(new Set())

  // Getters
  const isP2P = computed(() => type.value === 'p2p')
  const isFundraiser = computed(() => type.value === 'fundraiser')
  const maxFormsAllowed = computed(() => (isP2P.value ? 1 : Infinity))

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
      createdAt: createdAt.value,
      updatedAt: updatedAt.value,
      stats: stats.value,
      crowdfunding: crowdfunding.value,
      peerToPeer: peerToPeer.value,
      fundraisers: fundraisers.value,
      recentDonations: recentDonations.value,
      forms: []
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
    stats.value = { ...campaign.stats }
    crowdfunding.value = { ...campaign.crowdfunding }
    peerToPeer.value = { ...campaign.peerToPeer }
    fundraisers.value = [...campaign.fundraisers]
    recentDonations.value = [...campaign.recentDonations]
    createdAt.value = campaign.createdAt
    updatedAt.value = campaign.updatedAt
    pendingFormDeletes.value = new Set()
    markClean()
  }

  function reset() {
    id.value = null
    type.value = 'standard'
    p2pPreset.value = null
    parentCampaignId.value = null
    name.value = ''
    status.value = 'draft'
    stats.value = null
    crowdfunding.value = null
    peerToPeer.value = null
    fundraisers.value = []
    recentDonations.value = []
    createdAt.value = ''
    updatedAt.value = ''
    pendingFormDeletes.value = new Set()
    markClean()
  }

  function addPendingFormDelete(formId: string) {
    pendingFormDeletes.value = new Set([...pendingFormDeletes.value, formId])
    markDirty()
  }

  function commitFormDeletes(campaignId: string) {
    const formsStore = useFormsStore()
    for (const formId of pendingFormDeletes.value) {
      formsStore.deleteForm(campaignId, formId)
    }
    pendingFormDeletes.value = new Set()
  }

  return {
    // State
    id,
    type,
    p2pPreset,
    parentCampaignId,
    name,
    status,
    stats,
    crowdfunding,
    peerToPeer,
    fundraisers,
    recentDonations,
    createdAt,
    updatedAt,
    pendingFormDeletes,
    isDirty,
    isSaving,
    // Getters
    isP2P,
    isFundraiser,
    maxFormsAllowed,
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
    markClean,
    addPendingFormDelete,
    commitFormDeletes
  }
})
