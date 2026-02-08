import {
  defineForm,
  numberField,
  toggleField,
  fieldGroup
} from '~/features/_library/form-builder/api'
import type { Donor } from '~/features/donors/admin/types'

const useDonorFilterForm = defineForm('donorFilters', () => {
  const totalMin = numberField('totalMin', {
    label: 'Min Total Donated',
    min: 0
  })

  const totalMax = numberField('totalMax', {
    label: 'Max Total Donated',
    min: 0
  })

  const countMin = numberField('countMin', {
    label: 'Min Donations',
    min: 0,
    step: 1
  })

  const countMax = numberField('countMax', {
    label: 'Max Donations',
    min: 0,
    step: 1
  })

  const giftAid = toggleField('giftAid', {
    label: 'Gift Aid Eligible Only'
  })

  const filters = fieldGroup('filters', {
    label: 'Donor Filters',
    wrapperClass: 'space-y-4',
    fields: { totalMin, totalMax, countMin, countMax, giftAid }
  })

  return { filters }
})

interface DonorFilterValues {
  totalMin: number | null
  totalMax: number | null
  countMin: number | null
  countMax: number | null
  giftAid: boolean
}

const DEFAULT_VALUES: DonorFilterValues = {
  totalMin: null,
  totalMax: null,
  countMin: null,
  countMax: null,
  giftAid: false
}

export function useDonorFilters() {
  const form = useDonorFilterForm
  const filterValues = ref<DonorFilterValues>({ ...DEFAULT_VALUES })
  const appliedValues = ref<DonorFilterValues>({ ...DEFAULT_VALUES })

  const activeFilterCount = computed(() => {
    let count = 0
    const v = appliedValues.value
    if (v.totalMin != null) count++
    if (v.totalMax != null) count++
    if (v.countMin != null) count++
    if (v.countMax != null) count++
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

  function filterDonor(d: Donor): boolean {
    const v = appliedValues.value
    if (v.totalMin != null && d.totalDonated < v.totalMin) return false
    if (v.totalMax != null && d.totalDonated > v.totalMax) return false
    if (v.countMin != null && d.donationCount < v.countMin) return false
    if (v.countMax != null && d.donationCount > v.countMax) return false
    if (v.giftAid && !d.giftAid) return false
    return true
  }

  return {
    form,
    filterValues,
    activeFilterCount,
    applyFilters,
    resetFilters,
    filterDonor
  }
}
