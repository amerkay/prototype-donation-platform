import { computed } from 'vue'
import type { ContextSchema } from '~/features/_library/form-builder/conditions/types'
import { useFilterState } from '~/features/_library/form-builder/filters'
import { useCampaigns } from '~/features/campaigns/shared/composables/useCampaigns'
import { useCurrencySettingsStore } from '~/features/settings/admin/stores/currencySettings'
import { FUNDRAISER_STATUS_OPTIONS } from '~/features/campaigns/shared/types'

/** All statuses for filtering (includes terminal states not in the status dropdown) */
const FUNDRAISER_FILTER_STATUS_OPTIONS = [
  ...FUNDRAISER_STATUS_OPTIONS,
  { value: 'completed' as const, label: 'Completed' },
  { value: 'ended' as const, label: 'Ended' }
]

function useFundraiserSchema() {
  const { campaigns } = useCampaigns()
  const currencyStore = useCurrencySettingsStore()

  return computed<ContextSchema>(() => {
    const p2pTemplates = campaigns.value.filter((c) => c.type === 'p2p')
    const templateOptions = p2pTemplates.map((c) => ({ value: c.id, label: c.name }))
    const currencyOptions = currencyStore.supportedCurrencies.map((c) => ({
      value: c,
      label: c
    }))

    return {
      status: {
        label: 'Status',
        type: 'string',
        group: 'Fundraiser',
        options: FUNDRAISER_FILTER_STATUS_OPTIONS
      },
      raisedAmount: { label: 'Raised Amount', type: 'number', group: 'Fundraiser' },
      donationCount: { label: 'Donation Count', type: 'number', group: 'Fundraiser' },
      goal: { label: 'Goal', type: 'number', group: 'Fundraiser' },
      currency: {
        label: 'Currency',
        type: 'string',
        group: 'Fundraiser',
        options: currencyOptions
      },
      parentCampaignId: {
        label: 'Template',
        type: 'string',
        group: 'Fundraiser',
        options: templateOptions
      }
    }
  })
}

export function useFundraiserFilters() {
  const schema = useFundraiserSchema()
  return useFilterState('fundraiser-filters', schema)
}
