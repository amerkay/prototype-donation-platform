import { computed } from 'vue'
import type { ContextSchema } from '~/features/_library/form-builder/conditions/types'
import { useFilterState } from '~/features/_library/form-builder/filters'
import {
  useEntityDataService,
  type EnrichedSubscription
} from '~/features/_admin/composables/useEntityDataService'
import {
  buildCustomFieldSchema,
  withCustomFieldEvaluators
} from '~/features/_admin/utils/buildCustomFieldSchema'
import { buildSingleEntityEvaluators } from '~/features/_admin/utils/buildCrossEntityEvaluators'

const BASE_SCHEMA: ContextSchema = {
  status: {
    label: 'Status',
    type: 'string',
    group: 'Subscription',
    options: [
      { value: 'active', label: 'Active' },
      { value: 'paused', label: 'Paused' },
      { value: 'cancelled', label: 'Cancelled' }
    ]
  },
  amount: { label: 'Amount', type: 'number', group: 'Subscription' },
  frequency: {
    label: 'Frequency',
    type: 'string',
    group: 'Subscription',
    options: [
      { value: 'monthly', label: 'Monthly' },
      { value: 'yearly', label: 'Yearly' }
    ]
  },
  'donor.totalDonated': { label: 'Total Donated', type: 'number', group: 'Related Donor' },
  'donor.donationCount': { label: 'Donation Count', type: 'number', group: 'Related Donor' },
  'donor.giftAid': { label: 'Gift Aid Eligible', type: 'boolean', group: 'Related Donor' }
}

function useSubscriptionSchema() {
  const dataService = useEntityDataService()
  return computed<ContextSchema>(() => ({
    ...BASE_SCHEMA,
    ...buildCustomFieldSchema(dataService.transactions.value)
  }))
}

function buildCustomEvaluators() {
  const dataService = useEntityDataService()

  const getSubTransactions = (item: EnrichedSubscription) =>
    dataService.transactionsByDonorId.value.get(item.donorId) ?? []

  const evaluators = {
    ...buildSingleEntityEvaluators(
      (item: EnrichedSubscription) => dataService.donorById.value.get(item.donorId),
      {
        'donor.totalDonated': (d) => d.totalDonated,
        'donor.donationCount': (d) => d.donationCount,
        'donor.giftAid': (d) => d.giftAid
      }
    )
  }

  return withCustomFieldEvaluators(evaluators, (item) =>
    getSubTransactions(item as EnrichedSubscription)
  )
}

export function useSubscriptionFilters() {
  const schema = useSubscriptionSchema()
  const customEvaluators = buildCustomEvaluators()
  return useFilterState('subscriptionFilters', schema, { customEvaluators })
}
