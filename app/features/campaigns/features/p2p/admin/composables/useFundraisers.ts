import { computed } from 'vue'
import { toast } from 'vue-sonner'
import { useCampaigns } from '~/features/campaigns/shared/composables/useCampaigns'
import { useCampaignConfigStore } from '~/features/campaigns/shared/stores/campaignConfig'
import { useAdminDateRangeStore } from '~/features/_admin/stores/adminDateRange'
import type { CampaignFundraiser, FundraiserStatus } from '~/features/campaigns/shared/types'
import type { FundraiserMatchContext } from '~/features/campaigns/features/p2p/admin/columns/fundraiserColumns'
import { formatCurrency } from '~/lib/formatCurrency'
import { useCurrencySettingsStore } from '~/features/settings/admin/stores/currencySettings'

export function useFundraisers() {
  const { campaigns, getCampaignById, updateCampaign } = useCampaigns()
  const configStore = useCampaignConfigStore()
  const dateStore = useAdminDateRangeStore()
  const currencyStore = useCurrencySettingsStore()

  /** All fundraisers across all P2P templates (filtered by date range) */
  const allFundraisers = computed(() => {
    const result: CampaignFundraiser[] = []
    for (const campaign of campaigns.value) {
      if (campaign.type !== 'p2p') continue
      for (const f of campaign.fundraisers) {
        if (dateStore.isWithinRange(f.createdAt)) result.push(f)
      }
    }
    return result
  })

  /** Get parent campaign name for a fundraiser */
  const getParentName = (parentCampaignId: string): string => {
    return getCampaignById(parentCampaignId)?.name ?? 'Unknown'
  }

  /** Lookup a single fundraiser by its id */
  const getFundraiserById = (id: string): CampaignFundraiser | undefined => {
    return allFundraisers.value.find((f) => f.id === id)
  }

  /** Stats for AdminListPage header */
  const stats = computed(() => {
    const active = allFundraisers.value.filter((f) => f.status === 'active').length
    // TODO: cross-currency aggregation — currently sums without conversion
    const totalRaised = allFundraisers.value.reduce((sum, f) => sum + f.raisedAmount, 0)
    const avg = allFundraisers.value.length > 0 ? totalRaised / allFundraisers.value.length : 0

    return [
      { value: active, label: 'active' },
      { value: formatCurrency(totalRaised, currencyStore.defaultCurrency), label: 'raised' },
      { value: formatCurrency(avg, currencyStore.defaultCurrency), label: 'avg per fundraiser' }
    ]
  })

  /** Update a fundraiser's status in the parent campaign's fundraisers array */
  async function updateFundraiserStatus(
    fundraiserId: string,
    newStatus: FundraiserStatus
  ): Promise<void> {
    for (const campaign of campaigns.value) {
      if (campaign.type !== 'p2p') continue
      const idx = campaign.fundraisers.findIndex((f) => f.id === fundraiserId)
      if (idx === -1) continue

      const updated = [...campaign.fundraisers]
      updated[idx] = {
        ...updated[idx]!,
        status: newStatus,
        ...(newStatus === 'completed' ? { completedAt: new Date().toISOString() } : {})
      }

      await updateCampaign(campaign.id, { fundraisers: updated })
      if (configStore.id === campaign.id) configStore.fundraisers = updated
      toast.success(`Fundraiser ${newStatus === 'ended' ? 'ended' : `set to ${newStatus}`}`)
      return
    }
  }

  const completeFundraiser = (id: string) => updateFundraiserStatus(id, 'completed')
  const endFundraiser = (id: string) => updateFundraiserStatus(id, 'ended')
  const reactivateFundraiser = (id: string) => updateFundraiserStatus(id, 'active')

  /** Resolve matched giving context for a fundraiser via getCampaignById (data-layer aware) */
  const getMatchContext = (f: CampaignFundraiser): FundraiserMatchContext | null => {
    const fundraiserCampaign = getCampaignById(f.campaignId)
    if (!fundraiserCampaign?.matchedGiving?.periods?.length) return null
    const totalMatched = fundraiserCampaign.stats.totalMatched ?? 0
    return { matchedGiving: fundraiserCampaign.matchedGiving, totalMatched }
  }

  return {
    allFundraisers,
    getFundraiserById,
    getMatchContext,
    getParentName,
    stats,
    completeFundraiser,
    endFundraiser,
    reactivateFundraiser,
    updateFundraiserStatus
  }
}
