import { ref, computed } from 'vue'
import type { Campaign } from '../types'
import { campaigns as mockCampaigns } from '~/sample-api-responses/api-sample-response-campaigns'

/**
 * Campaigns Composable (Singleton Pattern)
 *
 * Provides reactive access to campaign data with helper functions.
 * In production, replace mock data with API calls.
 *
 * @example
 * ```ts
 * const { campaigns, getCampaignById, getRecentCampaigns } = useCampaigns()
 * const campaign = getCampaignById('adopt-orangutan')
 * ```
 */

// Singleton state
const campaigns = ref<Campaign[]>(mockCampaigns)
const isLoading = ref(false)
const error = ref<Error | null>(null)

export function useCampaigns() {
  /**
   * Get campaign by ID
   */
  const getCampaignById = (id: string): Campaign | undefined => {
    return campaigns.value.find((c) => c.id === id)
  }

  /**
   * Get recent campaigns (sorted by updated date, limited to N)
   */
  const getRecentCampaigns = (limit = 3): Campaign[] => {
    return [...campaigns.value]
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
    updateCampaign
  }
}
