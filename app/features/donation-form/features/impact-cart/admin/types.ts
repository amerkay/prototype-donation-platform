/**
 * Impact cart (multiple products) configuration types
 */

import type { Product } from '~/features/donation-form/features/product/shared/types'

export interface ImpactCartSettings {
  enabled: boolean
  products: Product[]
  settings: {
    initialDisplay: number
    quantityRemaining?: Record<string, number>
  }
}
