import type { ContextSchema } from '~/features/_library/form-builder/conditions/types'
import { useFilterState } from '~/features/_library/form-builder/filters'

const SCHEMA: ContextSchema = {
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
  }
}

export function useSubscriptionFilters() {
  return useFilterState('subscriptionFilters', SCHEMA)
}
