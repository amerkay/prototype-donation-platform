export interface Product {
  id: string
  name: string
  description: string
  price?: number
  minPrice?: number
  default?: number
  frequency: 'once' | 'monthly' | 'yearly'
  image: string | null
  thumbnail?: string
  icon?: string
  isShippingRequired?: boolean
  /** Override name shown on certificates (e.g., "Maya" instead of full product name) */
  certificateOverrideName?: string
}
