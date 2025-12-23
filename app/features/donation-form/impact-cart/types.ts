/**
 * Impact cart (multiple products) configuration types
 */
import type { Product } from '~/features/donation-form/product/types'
import type { TributeData } from '~/features/donation-form/tribute/types'

export interface ImpactCartSettings {
  enabled: boolean
  settings: {
    initialDisplay: number
  }
}

export type FrequencyType = 'once' | 'monthly' | 'yearly'
export type CartFrequencyType = FrequencyType

export interface CartItem extends Product {
  addedAt: number
  quantity?: number
  tribute?: TributeData
}
