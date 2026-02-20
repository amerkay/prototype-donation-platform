import { computed, type Ref } from 'vue'
import type {
  ContextSchema,
  ComparisonOperator
} from '~/features/_library/form-builder/conditions/types'
import { OPERATORS } from '~/features/_library/form-builder/conditions/operators'
import { useFilterState } from '~/features/_library/form-builder/filters'
import type { Transaction } from '~/features/donor-portal/types'
import { useEntityDataService } from '~/features/_admin/composables/useEntityDataService'
import { buildCustomFieldSchema } from '~/features/_admin/utils/buildCustomFieldSchema'
import {
  buildSingleEntityEvaluators,
  buildCollectionEvaluators
} from '~/features/_admin/utils/buildCrossEntityEvaluators'

/**
 * Build donation filter schema with dynamic product + custom field options.
 * Uses all transactions (unfiltered) for stable schema options across date ranges.
 */
function useDonationSchema(allTransactions: Ref<Transaction[]>) {
  return computed<ContextSchema>(() => {
    const productTitles = new Set<string>()
    for (const t of allTransactions.value) {
      for (const item of t.lineItems) {
        productTitles.add(item.productTitle)
      }
    }

    return {
      status: {
        label: 'Status',
        type: 'string',
        group: 'Transaction',
        options: [
          { value: 'succeeded', label: 'Succeeded' },
          { value: 'pending', label: 'Pending' },
          { value: 'failed', label: 'Failed' },
          { value: 'refunded', label: 'Refunded' }
        ]
      },
      totalAmount: { label: 'Amount', type: 'number', group: 'Transaction' },
      'paymentMethod.type': {
        label: 'Payment Method',
        type: 'string',
        group: 'Transaction',
        options: [
          { value: 'card', label: 'Card' },
          { value: 'paypal', label: 'PayPal' },
          { value: 'bank_transfer', label: 'Bank Transfer' }
        ]
      },
      type: {
        label: 'Type',
        type: 'string',
        group: 'Transaction',
        options: [
          { value: 'one_time', label: 'One-time' },
          { value: 'subscription_payment', label: 'Subscription' }
        ]
      },
      giftAid: { label: 'Gift Aid', type: 'boolean', group: 'Donor' },
      product: {
        label: 'Product',
        type: 'string',
        group: 'Line Items',
        options: [...productTitles].sort().map((name) => ({ value: name, label: name }))
      },
      tribute: { label: 'Has Tribute', type: 'boolean', group: 'Donor' },
      'tribute.type': {
        label: 'Tribute Type',
        type: 'string',
        group: 'Donor',
        options: [
          { value: 'gift', label: 'Gift' },
          { value: 'memorial', label: 'Memorial' }
        ]
      },
      'donor.totalDonated': { label: 'Total Donated', type: 'number', group: 'Related Donor' },
      'donor.donationCount': { label: 'Donation Count', type: 'number', group: 'Related Donor' },
      'donor.giftAid': { label: 'Gift Aid Eligible', type: 'boolean', group: 'Related Donor' },
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
      'subscription.amount': {
        label: 'Amount',
        type: 'number',
        group: 'Related Subscription'
      },
      ...buildCustomFieldSchema(allTransactions.value)
    }
  })
}

function buildCustomEvaluators() {
  const dataService = useEntityDataService()

  return {
    product: (conditionValue: unknown, item: unknown, operator: ComparisonOperator) => {
      const t = item as Transaction
      return OPERATORS[operator](
        t.lineItems.map((li) => li.productTitle),
        conditionValue
      )
    },
    tribute: (conditionValue: unknown, item: unknown, operator: ComparisonOperator) => {
      return OPERATORS[operator](!!(item as Transaction).tribute, conditionValue)
    },
    'tribute.type': (conditionValue: unknown, item: unknown, operator: ComparisonOperator) => {
      return OPERATORS[operator]((item as Transaction).tribute?.type, conditionValue)
    },
    ...buildSingleEntityEvaluators(
      (item: Transaction) => dataService.donorById.value.get(item.donorId),
      {
        'donor.totalDonated': (d) => d.totalDonated,
        'donor.donationCount': (d) => d.donationCount,
        'donor.giftAid': (d) => d.giftAid
      }
    ),
    ...buildCollectionEvaluators(
      (item: Transaction) => dataService.subscriptionsByDonorId.value.get(item.donorId) ?? [],
      {
        'subscription.status': (s) => s.status,
        'subscription.frequency': (s) => s.frequency,
        'subscription.amount': (s) => s.amount
      }
    )
  }
}

export function useDonationFilters() {
  const dataService = useEntityDataService()
  const schema = useDonationSchema(dataService.transactions)
  const customEvaluators = buildCustomEvaluators()
  // customFields.* paths resolve via getValueAtPath on Transaction objects
  return useFilterState('donationFilters', schema, { customEvaluators })
}
