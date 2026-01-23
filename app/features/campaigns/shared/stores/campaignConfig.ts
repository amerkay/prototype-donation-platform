import { defineStore } from 'pinia'
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
export const useCampaignConfigStore = defineStore('campaignConfig', {
  state: () => ({
    // Campaign ID
    id: null as string | null,

    // Basic settings (flat for v-model binding)
    name: '',
    status: 'draft' as CampaignStatus,

    // Statistics (read-only in admin, but needed for preview)
    stats: null as CampaignStats | null,

    // Crowdfunding page settings (editable)
    crowdfunding: null as CrowdfundingSettings | null,

    // Peer-to-peer fundraising settings (editable)
    peerToPeer: null as PeerToPeerSettings | null,

    // Charity info (read-only display in preview, not editable here)
    charity: null as CharityInfo | null,

    // Social sharing settings (editable)
    socialSharing: null as SocialSharingSettings | null,

    // Fundraisers list
    fundraisers: [] as CampaignFundraiser[],

    // Recent donations for preview
    recentDonations: [] as CampaignDonation[],

    // Metadata
    createdAt: '',
    updatedAt: '',

    // UI state
    isDirty: false,
    isSaving: false
  }),

  getters: {
    /**
     * Progress percentage for goal (0-100)
     */
    progressPercentage(state): number {
      if (!state.stats?.goalAmount || state.stats.goalAmount === 0) return 0
      return Math.min((state.stats.totalRaised / state.stats.goalAmount) * 100, 100)
    },

    /**
     * Amount remaining to reach goal
     */
    remainingAmount(state): number {
      if (!state.stats?.goalAmount) return 0
      return Math.max(state.stats.goalAmount - state.stats.totalRaised, 0)
    },

    /**
     * Donations sorted by most recent first
     */
    donationsByRecent(state): CampaignDonation[] {
      return [...state.recentDonations].sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      )
    },

    /**
     * Donations sorted by highest amount first
     */
    donationsByAmount(state): CampaignDonation[] {
      return [...state.recentDonations].sort((a, b) => b.amount - a.amount)
    },

    /**
     * Get donations based on current view setting
     */
    displayDonations(state): CampaignDonation[] {
      const view = state.crowdfunding?.defaultDonationsView || 'recent'
      const limit = state.crowdfunding?.numberOfDonationsToShow || 10
      const sorted =
        view === 'top'
          ? [...state.recentDonations].sort((a, b) => b.amount - a.amount)
          : [...state.recentDonations].sort(
              (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
            )
      return sorted.slice(0, limit)
    },

    /**
     * Reconstruct full Campaign object for API submission
     */
    fullCampaign(state): Campaign | null {
      if (
        !state.id ||
        !state.stats ||
        !state.crowdfunding ||
        !state.peerToPeer ||
        !state.charity ||
        !state.socialSharing
      ) {
        return null
      }

      return {
        id: state.id,
        name: state.name,
        status: state.status,
        createdAt: state.createdAt,
        updatedAt: state.updatedAt,
        stats: state.stats,
        crowdfunding: state.crowdfunding,
        peerToPeer: state.peerToPeer,
        charity: state.charity,
        socialSharing: state.socialSharing,
        fundraisers: state.fundraisers,
        recentDonations: state.recentDonations
      }
    }
  },

  actions: {
    /**
     * Initialize store from Campaign object
     * Destructures campaign into flat store structure
     */
    initialize(campaign: Campaign) {
      this.id = campaign.id
      this.name = campaign.name
      this.status = campaign.status
      this.stats = { ...campaign.stats }
      this.crowdfunding = { ...campaign.crowdfunding }
      this.peerToPeer = { ...campaign.peerToPeer }
      this.charity = { ...campaign.charity }
      this.socialSharing = { ...campaign.socialSharing }
      this.fundraisers = [...campaign.fundraisers]
      this.recentDonations = [...campaign.recentDonations]
      this.createdAt = campaign.createdAt
      this.updatedAt = campaign.updatedAt
      this.isDirty = false
      this.isSaving = false
    },

    /**
     * Mark store as having unsaved changes
     */
    markDirty() {
      this.isDirty = true
    },

    /**
     * Reset dirty flag after save
     */
    markClean() {
      this.isDirty = false
      this.updatedAt = new Date().toISOString()
    },

    /**
     * Update goal settings
     */
    updateGoal(goalAmount: number | undefined) {
      if (this.stats) {
        this.stats = {
          ...this.stats,
          goalAmount
        }
        this.isDirty = true
      }
    },

    /**
     * Clear store state
     */
    reset() {
      this.id = null
      this.name = ''
      this.status = 'draft'
      this.stats = null
      this.crowdfunding = null
      this.peerToPeer = null
      this.charity = null
      this.socialSharing = null
      this.fundraisers = []
      this.recentDonations = []
      this.createdAt = ''
      this.updatedAt = ''
      this.isDirty = false
      this.isSaving = false
    }
  }
})
