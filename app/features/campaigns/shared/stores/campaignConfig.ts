import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type {
  Campaign,
  CampaignStats,
  CrowdfundingSettings,
  PeerToPeerSettings,
  CharityInfo,
  SocialSharingSettings,
  CampaignDonation,
  CampaignFundraiser,
  CampaignStatus
} from '~/features/campaigns/shared/types'
import { useEditableState } from '~/features/_admin/composables/defineEditableStore'

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
  const name = ref('')
  const status = ref<CampaignStatus>('draft')
  const stats = ref<CampaignStats | null>(null)
  const crowdfunding = ref<CrowdfundingSettings | null>(null)
  const peerToPeer = ref<PeerToPeerSettings | null>(null)
  const charity = ref<CharityInfo | null>(null)
  const socialSharing = ref<SocialSharingSettings | null>(null)
  const fundraisers = ref<CampaignFundraiser[]>([])
  const recentDonations = ref<CampaignDonation[]>([])
  const createdAt = ref('')
  const updatedAt = ref('')

  // Getters
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
    if (
      !id.value ||
      !stats.value ||
      !crowdfunding.value ||
      !peerToPeer.value ||
      !charity.value ||
      !socialSharing.value
    ) {
      return null
    }

    return {
      id: id.value,
      name: name.value,
      status: status.value,
      createdAt: createdAt.value,
      updatedAt: updatedAt.value,
      stats: stats.value,
      crowdfunding: crowdfunding.value,
      peerToPeer: peerToPeer.value,
      charity: charity.value,
      socialSharing: socialSharing.value,
      fundraisers: fundraisers.value,
      recentDonations: recentDonations.value,
      forms: []
    }
  })

  // Actions
  function initialize(campaign: Campaign) {
    id.value = campaign.id
    name.value = campaign.name
    status.value = campaign.status
    stats.value = { ...campaign.stats }
    crowdfunding.value = { ...campaign.crowdfunding }
    peerToPeer.value = { ...campaign.peerToPeer }
    charity.value = { ...campaign.charity }
    socialSharing.value = { ...campaign.socialSharing }
    fundraisers.value = [...campaign.fundraisers]
    recentDonations.value = [...campaign.recentDonations]
    createdAt.value = campaign.createdAt
    updatedAt.value = campaign.updatedAt
    markClean()
  }

  function reset() {
    id.value = null
    name.value = ''
    status.value = 'draft'
    stats.value = null
    crowdfunding.value = null
    peerToPeer.value = null
    charity.value = null
    socialSharing.value = null
    fundraisers.value = []
    recentDonations.value = []
    createdAt.value = ''
    updatedAt.value = ''
    markClean()
  }

  return {
    // State
    id,
    name,
    status,
    stats,
    crowdfunding,
    peerToPeer,
    charity,
    socialSharing,
    fundraisers,
    recentDonations,
    createdAt,
    updatedAt,
    isDirty,
    isSaving,
    // Getters
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
