/**
 * Impact cart runtime types (used by donor-facing cart components and store)
 */
import type { Product } from '~/features/donation-form/features/product/shared/types'
import type { TributeData } from '~/features/donation-form/features/tribute/donor/types'

export type FrequencyType = 'once' | 'monthly' | 'yearly'
export type CartFrequencyType = FrequencyType

export interface CartItem extends Product {
  addedAt: number
  quantity?: number
  tribute?: TributeData
  /** Custom field values collected via form-level entry fields */
  entryData?: Record<string, unknown>
}
