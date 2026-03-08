/**
 * Product selector configuration types
 */

import type { Product } from '~/features/donation-form/features/product/shared/types'

export interface ProductSelectorSettings {
  enabled: boolean
  products: Product[]
  config: {
    icon: string
    entity: {
      singular: string
      plural: string
    }
    action: {
      verb: string
      noun: string
    }
  }
}
