import { ref, computed } from 'vue'
import { toast } from 'vue-sonner'
import type { Campaign, CampaignType } from '~/features/campaigns/shared/types'
import { campaigns as mockCampaigns } from '~/sample-api-responses/api-sample-response-campaigns'

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

// Singleton state
const campaigns = ref<Campaign[]>([...mockCampaigns])
const isLoading = ref(false)
const error = ref<Error | null>(null)
let hydrated = false

export function useCampaigns() {
  // Hydrate from sessionStorage on first use
  if (!hydrated) {
    $hydrate()
  }

  /**
   * Get campaign by ID
   */
  const getCampaignById = (id: string): Campaign | undefined => {
    return campaigns.value.find((c) => c.id === id)
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

    isLoading.value = true
    error.value = null
    try {
      // TODO: Replace with actual API call
      // await $fetch(`/api/campaigns/${id}`, {
      //   method: 'PATCH',
      //   body: updates
      // })
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

  /**
   * Create a new campaign
   */
  const createCampaign = (campaignData: Partial<Campaign>): string => {
    // Generate unique ID
    const id = `campaign-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`

    // Create new campaign with defaults
    const newCampaign: Campaign = {
      id,
      type: campaignData.type ?? 'standard',
      name: campaignData.name ?? 'Untitled Campaign',
      status: 'draft',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      stats: {
        totalRaised: 0,
        totalDonations: 0,
        totalDonors: 0,
        averageDonation: 0,
        topDonation: 0,
        currency: 'GBP'
      },
      crowdfunding: campaignData.crowdfunding ?? {
        enabled: true,
        title: '',
        shortDescription: '',
        story: '',
        showProgressBar: true,
        showRecentDonations: true,
        defaultDonationsView: 'recent',
        numberOfDonationsToShow: 5
      },
      peerToPeer: campaignData.peerToPeer ?? {
        enabled: false
      },
      socialSharing: campaignData.socialSharing ?? {
        enabled: true,
        facebook: true,
        twitter: true,
        linkedin: true,
        whatsapp: true,
        email: true,
        copyLink: true
      },
      fundraisers: [],
      recentDonations: [],
      forms: [],
      ...campaignData
    }

    // Add to campaigns array
    campaigns.value.push(newCampaign)

    $persist()

    return id
  }

  /** Persistence - save all campaigns (modified mocks + user-created) to sessionStorage (client-only) */
  function $persist(): void {
    if (!import.meta.client) return
    try {
      sessionStorage.setItem('campaigns', JSON.stringify(campaigns.value))
    } catch (error) {
      console.warn('Failed to persist campaigns:', error)
    }
  }

  /** Hydration - restore persisted campaigns, falling back to mock data (client-only) */
  function $hydrate(): void {
    if (hydrated) return
    if (!import.meta.client) return

    try {
      const saved = sessionStorage.getItem('campaigns')
      if (saved) {
        campaigns.value = JSON.parse(saved) as Campaign[]
      }
      hydrated = true
    } catch (error) {
      console.warn('Failed to hydrate campaigns:', error)
      hydrated = true
    }
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
    createCampaign
  }
}
