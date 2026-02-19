import type { ContextSchema } from '~/features/_library/form-builder/conditions/types'
import { useFilterState } from '~/features/_library/form-builder/filters'

const SCHEMA: ContextSchema = {
  totalDonated: { label: 'Total Donated', type: 'number', group: 'Donor' },
  donationCount: { label: 'Donation Count', type: 'number', group: 'Donor' },
  giftAid: { label: 'Gift Aid Eligible', type: 'boolean', group: 'Donor' }
}

export function useDonorFilters() {
  return useFilterState('donorFilters', SCHEMA)
}
