import { computed } from 'vue'
import type { ContextSchema } from '~/features/_library/form-builder/conditions/types'
import { useFilterState } from '~/features/_library/form-builder/filters'
import type { Donor } from '~/features/donors/admin/types'
import { useEntityDataService } from '~/features/_admin/composables/useEntityDataService'
import {
  buildCustomFieldSchema,
  withCustomFieldEvaluators
} from '~/features/_admin/utils/buildCustomFieldSchema'
import { buildCollectionEvaluators } from '~/features/_admin/utils/buildCrossEntityEvaluators'

const BASE_SCHEMA: ContextSchema = {
  totalDonated: { label: 'Total Donated', type: 'number', group: 'Donor' },
  donationCount: { label: 'Donation Count', type: 'number', group: 'Donor' },
  giftAid: { label: 'Gift Aid Eligible', type: 'boolean', group: 'Donor' },
  'donation.status': {
    label: 'Status',
    type: 'string',
    group: 'Related Donation',
    options: [
      { value: 'succeeded', label: 'Succeeded' },
      { value: 'pending', label: 'Pending' },
      { value: 'failed', label: 'Failed' },
      { value: 'refunded', label: 'Refunded' }
    ]
  },
  'donation.totalAmount': { label: 'Amount', type: 'number', group: 'Related Donation' },
  'donation.paymentMethod.type': {
    label: 'Payment Method',
    type: 'string',
    group: 'Related Donation',
    options: [
      { value: 'card', label: 'Card' },
      { value: 'paypal', label: 'PayPal' },
      { value: 'bank_transfer', label: 'Bank Transfer' }
    ]
  },
  'donation.type': {
    label: 'Type',
    type: 'string',
    group: 'Related Donation',
    options: [
      { value: 'one_time', label: 'One-time' },
      { value: 'subscription_payment', label: 'Subscription' }
    ]
  },
  'subscription.status': {
    label: 'Status',
    type: 'string',
    group: 'Related Subscription',
    options: [
      { value: 'active', label: 'Active' },
      { value: 'paused', label: 'Paused' },
      { value: 'cancelled', label: 'Cancelled' }
    ]
  },
  'subscription.frequency': {
    label: 'Frequency',
    type: 'string',
    group: 'Related Subscription',
    options: [
      { value: 'monthly', label: 'Monthly' },
      { value: 'yearly', label: 'Yearly' }
    ]
  },
  'subscription.amount': { label: 'Amount', type: 'number', group: 'Related Subscription' }
}

function useDonorSchema() {
  const dataService = useEntityDataService()
  return computed<ContextSchema>(() => ({
    ...BASE_SCHEMA,
    ...buildCustomFieldSchema(dataService.transactions.value)
  }))
}

function buildCustomEvaluators() {
  const dataService = useEntityDataService()

  const getDonorTransactions = (item: Donor) =>
    dataService.transactionsByDonorId.value.get(item.id) ?? []

  const evaluators = {
    ...buildCollectionEvaluators(getDonorTransactions, {
      'donation.status': (t) => t.status,
      'donation.totalAmount': (t) => t.totalAmount,
      'donation.paymentMethod.type': (t) => t.paymentMethod.type,
      'donation.type': (t) => t.type
    }),
    ...buildCollectionEvaluators(
      (item: Donor) => dataService.subscriptionsByDonorId.value.get(item.id) ?? [],
      {
        'subscription.status': (s) => s.status,
        'subscription.frequency': (s) => s.frequency,
        'subscription.amount': (s) => s.amount
      }
    )
  }

  return withCustomFieldEvaluators(evaluators, (item) => getDonorTransactions(item as Donor))
}

export function useDonorFilters() {
  const schema = useDonorSchema()
  const customEvaluators = buildCustomEvaluators()
  return useFilterState('donorFilters', schema, { customEvaluators })
}
