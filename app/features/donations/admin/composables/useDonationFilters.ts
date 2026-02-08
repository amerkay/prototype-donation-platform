import {
  defineForm,
  selectField,
  numberField,
  toggleField,
  fieldGroup
} from '~/features/_library/form-builder/api'
import type { Transaction } from '~/features/donor-portal/types'

const useDonationFilterForm = defineForm('donationFilters', () => {
  const status = selectField('status', {
    label: 'Status',
    options: [
      { value: 'all', label: 'All' },
      { value: 'succeeded', label: 'Succeeded' },
      { value: 'pending', label: 'Pending' },
      { value: 'failed', label: 'Failed' },
      { value: 'refunded', label: 'Refunded' }
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

  const paymentMethod = selectField('paymentMethod', {
    label: 'Payment Method',
    options: [
      { value: 'all', label: 'All' },
      { value: 'card', label: 'Card' },
      { value: 'paypal', label: 'PayPal' },
      { value: 'bank_transfer', label: 'Bank Transfer' }
    ]
  })

  const type = selectField('type', {
    label: 'Type',
    options: [
      { value: 'all', label: 'All' },
      { value: 'one_time', label: 'One-time' },
      { value: 'subscription_payment', label: 'Subscription' }
    ]
  })

  const giftAid = toggleField('giftAid', {
    label: 'Gift Aid Only'
  })

  const filters = fieldGroup('filters', {
    label: 'Donation Filters',
    wrapperClass: 'space-y-4',
    fields: { status, amountMin, amountMax, paymentMethod, type, giftAid }
  })

  return { filters }
})

interface DonationFilterValues {
  status: string
  amountMin: number | null
  amountMax: number | null
  paymentMethod: string
  type: string
  giftAid: boolean
}

const DEFAULT_VALUES: DonationFilterValues = {
  status: 'all',
  amountMin: null,
  amountMax: null,
  paymentMethod: 'all',
  type: 'all',
  giftAid: false
}

export function useDonationFilters() {
  const form = useDonationFilterForm
  const filterValues = ref<DonationFilterValues>({ ...DEFAULT_VALUES })
  const appliedValues = ref<DonationFilterValues>({ ...DEFAULT_VALUES })

  const activeFilterCount = computed(() => {
    let count = 0
    const v = appliedValues.value
    if (v.status !== 'all') count++
    if (v.amountMin != null) count++
    if (v.amountMax != null) count++
    if (v.paymentMethod !== 'all') count++
    if (v.type !== 'all') count++
    if (v.giftAid) count++
    return count
  })

  function applyFilters() {
    appliedValues.value = { ...filterValues.value }
  }

  function resetFilters() {
    filterValues.value = { ...DEFAULT_VALUES }
    appliedValues.value = { ...DEFAULT_VALUES }
  }

  function filterTransaction(t: Transaction): boolean {
    const v = appliedValues.value
    if (v.status !== 'all' && t.status !== v.status) return false
    if (v.amountMin != null && t.totalAmount < v.amountMin) return false
    if (v.amountMax != null && t.totalAmount > v.amountMax) return false
    if (v.paymentMethod !== 'all' && t.paymentMethod.type !== v.paymentMethod) return false
    if (v.type !== 'all' && t.type !== v.type) return false
    if (v.giftAid && !t.giftAid) return false
    return true
  }

  return {
    form,
    filterValues,
    activeFilterCount,
    applyFilters,
    resetFilters,
    filterTransaction
  }
}
