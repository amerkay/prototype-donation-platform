import {
  defineForm,
  selectField,
  numberField,
  fieldGroup
} from '~/features/_library/form-builder/api'
import type { Subscription } from '~/features/subscriptions/shared/types'

const useSubscriptionFilterForm = defineForm('subscriptionFilters', () => {
  const status = selectField('status', {
    label: 'Status',
    options: [
      { value: 'all', label: 'All' },
      { value: 'active', label: 'Active' },
      { value: 'paused', label: 'Paused' },
      { value: 'cancelled', label: 'Cancelled' }
    ]
  })

  const amountMin = numberField('amountMin', {
    label: 'Min Amount',
    min: 0
  })

  const amountMax = numberField('amountMax', {
    label: 'Max Amount',
    min: 0
  })

  const frequency = selectField('frequency', {
    label: 'Frequency',
    options: [
      { value: 'all', label: 'All' },
      { value: 'monthly', label: 'Monthly' },
      { value: 'yearly', label: 'Yearly' }
    ]
  })

  const filters = fieldGroup('filters', {
    label: 'Subscription Filters',
    wrapperClass: 'space-y-4',
    fields: { status, amountMin, amountMax, frequency }
  })

  return { filters }
})

interface SubscriptionFilterValues {
  status: string
  amountMin: number | null
  amountMax: number | null
  frequency: string
}

const DEFAULT_VALUES: SubscriptionFilterValues = {
  status: 'all',
  amountMin: null,
  amountMax: null,
  frequency: 'all'
}

export function useSubscriptionFilters() {
  const form = useSubscriptionFilterForm
  const filterValues = ref<SubscriptionFilterValues>({ ...DEFAULT_VALUES })
  const appliedValues = ref<SubscriptionFilterValues>({ ...DEFAULT_VALUES })

  const activeFilterCount = computed(() => {
    let count = 0
    const v = appliedValues.value
    if (v.status !== 'all') count++
    if (v.amountMin != null) count++
    if (v.amountMax != null) count++
    if (v.frequency !== 'all') count++
    return count
  })

  function applyFilters() {
    appliedValues.value = { ...filterValues.value }
  }

  function resetFilters() {
    filterValues.value = { ...DEFAULT_VALUES }
    appliedValues.value = { ...DEFAULT_VALUES }
  }

  function filterSubscription(s: Subscription): boolean {
    const v = appliedValues.value
    if (v.status !== 'all' && s.status !== v.status) return false
    if (v.amountMin != null && s.amount < v.amountMin) return false
    if (v.amountMax != null && s.amount > v.amountMax) return false
    if (v.frequency !== 'all' && s.frequency !== v.frequency) return false
    return true
  }

  return {
    form,
    filterValues,
    activeFilterCount,
    applyFilters,
    resetFilters,
    filterSubscription
  }
}
