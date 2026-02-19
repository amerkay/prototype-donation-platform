import { computed, type Ref } from 'vue'
import type {
  ContextSchema,
  ComparisonOperator
} from '~/features/_library/form-builder/conditions/types'
import { OPERATORS } from '~/features/_library/form-builder/conditions/operators'
import { useFilterState } from '~/features/_library/form-builder/filters'
import type { Transaction } from '~/features/donor-portal/types'

/**
 * Build donation filter schema with dynamic product options from transactions
 */
function useDonationSchema(transactions: Ref<Transaction[]>) {
  return computed<ContextSchema>(() => {
    // Extract unique product names from all line items
    const productNames = new Set<string>()
    for (const t of transactions.value) {
      for (const item of t.lineItems) {
        productNames.add(item.productName)
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
        options: [...productNames].sort().map((name) => ({ value: name, label: name }))
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
      }
    }
  })
}

/** Custom evaluators for fields with non-standard data access */
const CUSTOM_EVALUATORS: Record<
  string,
  (conditionValue: unknown, item: unknown, operator: ComparisonOperator) => boolean
> = {
  product: (conditionValue, item, operator) => {
    const t = item as Transaction
    const productNames = t.lineItems.map((li) => li.productName)
    return OPERATORS[operator](productNames, conditionValue)
  },
  tribute: (conditionValue, item, operator) => {
    const t = item as Transaction
    // isTrue → has tribute, isFalse → no tribute
    return OPERATORS[operator](!!t.tribute, conditionValue)
  },
  'tribute.type': (conditionValue, item, operator) => {
    const t = item as Transaction
    return OPERATORS[operator](t.tribute?.type, conditionValue)
  }
}

export function useDonationFilters(transactions: Ref<Transaction[]>) {
  const schema = useDonationSchema(transactions)
  return useFilterState('donationFilters', schema, { customEvaluators: CUSTOM_EVALUATORS })
}
