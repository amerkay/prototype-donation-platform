export interface Product {
  id: string
  /** Internal admin label (breadcrumbs, admin cards, sidebar) */
  name: string
  /** Donor-facing display title */
  title: string
  description: string
  price?: number
  minPrice?: number
  default?: number
  frequency: 'once' | 'monthly' | 'yearly'
  image: string | null
  thumbnail?: string
  icon?: string
  isShippingRequired?: boolean
  /** ID of the certificate template to use */
  certificateTemplateId?: string
  /** Title shown on certificates (overrides product title, e.g., "Maya") */
  certificateTitle?: string
  /** Text shown next to product image on certificates */
  certificateText?: string
}
