/**
 * Impact Product types for admin management.
 * Extends the base Product type with admin-specific fields.
 */
import type { Product } from '~/features/donation-form/features/product/shared/types'

export interface ImpactProduct extends Product {
  status: 'active' | 'archived'
  createdAt: string
  updatedAt: string
  /** Number of forms this product is linked to */
  linkedFormsCount: number
}
