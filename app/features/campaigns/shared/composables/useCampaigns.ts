import { ref, computed } from 'vue'
import { toast } from 'vue-sonner'
import type { Campaign, CampaignType, FundraiserStatus } from '~/features/campaigns/shared/types'
import type { DeleteProtection } from '~/features/_shared/composables/useEditState'
import { campaigns as mockCampaigns } from '~/sample-api-responses/api-sample-response-campaigns'
import { useSessionStorageSingleton } from '~/features/_admin/composables/useSessionStorageSingleton'

/**
 * Campaigns Composable (Singleton Pattern)
 *
 * Provides reactive access to campaign data with helper functions.
 * Uses sessionStorage for persistence until Supabase API is available.
 *
 * @example
 * ```ts
 * const { campaigns, getCampaignById, createCampaign } = useCampaigns()
 * const campaign = getCampaignById('adopt-orangutan')
 * ```
 */

// Singleton state — persistence via useSessionStorageSingleton factory
const {
  items: campaigns,
  $persist,
  ensureHydrated
} = useSessionStorageSingleton<Campaign>('campaigns', mockCampaigns)
const isLoading = ref(false)
const error = ref<Error | null>(null)

export function useCampaigns() {
  // Hydrate from sessionStorage on first use
  ensureHydrated()

  /**
   * Get raw campaign by ID (no parent merge — for internal write operations)
   */
  const getRawCampaignById = (id: string): Campaign | undefined => {
    return campaigns.value.find((c) => c.id === id)
  }

  /**
   * Get campaign by ID.
   * For p2p-fundraiser campaigns, automatically merges parent template fields
   * (form, matchedGiving, peerToPeer) so consumers always get the full view.
   */
  const getCampaignById = (id: string): Campaign | undefined => {
    const campaign = getRawCampaignById(id)
    if (!campaign) return undefined
    if (campaign.type !== 'p2p-fundraiser' || !campaign.parentCampaignId) return campaign

    const parent = getRawCampaignById(campaign.parentCampaignId)
    if (!parent) return campaign

    // Fundraiser metadata (in parent's fundraisers[]) is the source of truth for status —
    // it's what reactivate/complete/end actions update. The raw Campaign.status may be stale.
    const fundraiserMeta = parent.fundraisers.find((f) => f.campaignId === campaign.id)
    const resolvedStatus = fundraiserMeta?.status ?? campaign.status

    // Terminal fundraisers with no matched donations should not inherit matchedGiving —
    // they can't receive new donations, so an active match period is irrelevant.
    const isTerminal = resolvedStatus === 'completed' || resolvedStatus === 'ended'
    const stripMatchedGiving = isTerminal && (campaign.stats?.totalMatched ?? 0) === 0

    return {
      ...parent,
      // Fundraiser-specific overrides (what the fundraiser creator can edit)
      id: campaign.id,
      type: campaign.type,
      parentCampaignId: campaign.parentCampaignId,
      p2pPreset: campaign.p2pPreset,
      name: campaign.name,
      status: resolvedStatus,
      isArchived: campaign.isArchived,
      // Strip inherited matchedGiving when terminal with no matched donations
      ...(stripMatchedGiving && { matchedGiving: undefined }),
      crowdfunding: campaign.crowdfunding,
      stats: campaign.stats,
      recentDonations: campaign.recentDonations,
      fundraisers: campaign.fundraisers,
      form: campaign.form,
      createdAt: campaign.createdAt,
      updatedAt: campaign.updatedAt
    }
  }

  /**
   * Get recent campaigns (sorted by updated date, limited to N)
   */
  const getRecentCampaigns = (limit = 3, campaignType: CampaignType = 'standard'): Campaign[] => {
    return [...campaigns.value]
      .filter((c) => c.type === campaignType)
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
      .slice(0, limit)
  }

  /**
   * Get campaigns by status
   */
  const getCampaignsByStatus = (status: Campaign['status']): Campaign[] => {
    return campaigns.value.filter((c) => c.status === status)
  }

  /**
   * Active campaigns
   */
  const activeCampaigns = computed(() => getCampaignsByStatus('active'))

  /**
   * Total raised across all campaigns
   */
  const totalRaisedAllCampaigns = computed(() => {
    return campaigns.value.reduce((sum, c) => sum + c.stats.totalRaised, 0)
  })

  /**
   * Total donations across all campaigns
   */
  const totalDonationsAllCampaigns = computed(() => {
    return campaigns.value.reduce((sum, c) => sum + c.stats.totalDonations, 0)
  })

  /**
   * Refresh campaigns (placeholder for future API integration)
   */
  const refresh = async () => {
    isLoading.value = true
    error.value = null
    try {
      // TODO: Replace with actual API call
      // const response = await $fetch('/api/campaigns')
      // campaigns.value = response
      await new Promise((resolve) => setTimeout(resolve, 300)) // Simulate API delay
    } catch (e) {
      error.value = e as Error
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Update a campaign (placeholder for future API integration)
   * Updates are applied immediately to local state for reactivity
   */
  const updateCampaign = async (id: string, updates: Partial<Campaign>): Promise<void> => {
    const index = campaigns.value.findIndex((c) => c.id === id)
    if (index === -1) {
      throw new Error(`Campaign with id "${id}" not found`)
    }

    // Store reference for rollback
    const originalCampaign = campaigns.value[index]
    if (!originalCampaign) return

    // Optimistic update
    campaigns.value[index] = {
      ...originalCampaign,
      ...updates,
      updatedAt: new Date().toISOString()
    } as Campaign

    // For p2p-fundraiser campaigns: sync status to the fundraiser metadata in the parent's
    // fundraisers[] array, which is the source of truth for getCampaignById merges.
    if (
      updates.status &&
      originalCampaign.type === 'p2p-fundraiser' &&
      originalCampaign.parentCampaignId
    ) {
      const parentIdx = campaigns.value.findIndex((c) => c.id === originalCampaign.parentCampaignId)
      if (parentIdx !== -1) {
        const parent = campaigns.value[parentIdx]!
        const fIdx = parent.fundraisers.findIndex((f) => f.campaignId === id)
        if (fIdx !== -1) {
          const updatedFundraisers = [...parent.fundraisers]
          updatedFundraisers[fIdx] = {
            ...updatedFundraisers[fIdx]!,
            status: updates.status as FundraiserStatus
          }
          campaigns.value[parentIdx] = { ...parent, fundraisers: updatedFundraisers }
        }
      }
    }

    isLoading.value = true
    error.value = null
    try {
      // TODO-SUPABASE: Replace with supabase.from('campaigns').update(updates).eq('id', id)
      await new Promise((resolve) => setTimeout(resolve, 300)) // Simulate API delay
    } catch (e) {
      // Rollback on error
      campaigns.value[index] = originalCampaign
      error.value = e as Error
      throw e
    } finally {
      isLoading.value = false
    }

    $persist()
  }

  /**
   * Update campaign name with toast notification
   */
  const updateCampaignName = async (id: string, name: string): Promise<void> => {
    await updateCampaign(id, { name })
    toast.success('Campaign name updated')
  }

  /**
   * Update campaign status with toast notification
   */
  const updateCampaignStatus = async (id: string, status: Campaign['status']): Promise<void> => {
    await updateCampaign(id, { status })
    toast.success('Campaign status updated')
  }

  const archiveCampaign = async (id: string): Promise<void> => {
    await updateCampaign(id, { isArchived: true })
    toast.success('Campaign archived')
  }

  const unarchiveCampaign = async (id: string): Promise<void> => {
    await updateCampaign(id, { isArchived: false })
    toast.success('Campaign unarchived')
  }

  /**
   * Create a new campaign
   */
  const createCampaign = (campaignData: Partial<Campaign>): string => {
    // TODO-SUPABASE: Replace with supabase.from('campaigns').insert({ org_id: orgId, ...newCampaign }).select().single()
    // Generate unique ID
    const id = `campaign-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`

    // Create new campaign with defaults
    const newCampaign: Campaign = {
      id,
      type: campaignData.type ?? 'standard',
      name: campaignData.name ?? 'Untitled Campaign',
      status: 'draft',
      isArchived: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      stats: {
        totalRaised: 0,
        totalMatched: 0,
        totalDonations: 0,
        totalDonors: 0,
        averageDonation: 0,
        topDonation: 0,
        currency: campaignData.crowdfunding?.currency || 'GBP'
      },
      crowdfunding: campaignData.crowdfunding ?? {
        enabled: true,
        title: '',
        shortDescription: '',
        story: '',
        showProgressBar: true,
        showRecentDonations: true,
        defaultDonationsView: 'recent',
        numberOfDonationsToShow: 5,
        enableSocialSharing: true
      },
      peerToPeer: campaignData.peerToPeer ?? {
        enabled: false
      },
      matchedGiving: campaignData.matchedGiving ?? { periods: [] },
      fundraisers: [],
      recentDonations: [],
      form: campaignData.form ?? null,
      ...campaignData
    }

    // Add to campaigns array
    campaigns.value.push(newCampaign)

    $persist()

    return id
  }

  /**
   * Check if a campaign can be deleted
   */
  function getDeleteProtection(id: string): DeleteProtection {
    const campaign = getCampaignById(id)
    if (!campaign) return { canDelete: false, reason: 'Campaign not found' }
    if ((campaign.stats?.totalDonations ?? 0) > 0) {
      return { canDelete: false, reason: 'Cannot delete a campaign that has received donations' }
    }
    return { canDelete: true }
  }

  /**
   * Delete a campaign and its associated forms
   */
  const deleteCampaign = (id: string): void => {
    // TODO-SUPABASE: Replace with supabase.from('campaigns').delete().eq('id', id) (cascade deletes campaign_forms via FK)
    const index = campaigns.value.findIndex((c) => c.id === id)
    if (index === -1) return

    campaigns.value.splice(index, 1)

    $persist()
    toast.success('Campaign deleted')
  }

  return {
    // State
    campaigns: computed(() => campaigns.value),
    isLoading: computed(() => isLoading.value),
    error: computed(() => error.value),

    // Computed
    activeCampaigns,
    totalRaisedAllCampaigns,
    totalDonationsAllCampaigns,

    // Methods
    getCampaignById,
    getRecentCampaigns,
    getCampaignsByStatus,
    refresh,
    updateCampaign,
    updateCampaignName,
    updateCampaignStatus,
    archiveCampaign,
    unarchiveCampaign,
    createCampaign,
    deleteCampaign,
    getDeleteProtection
  }
}
