export interface Product {
  id: string
  name: string
  description: string
  price?: number
  minPrice?: number
  default?: number
  frequency: 'once' | 'monthly' | 'yearly'
  image: string
  thumbnail: string
  icon: string
  isBonusItem?: boolean
  isShippingRequired?: boolean
  bonusThreshold?: {
    once?: number
    monthly?: number
    yearly?: number
  }
}

export interface CartItem extends Product {
  addedAt: number
}

export type FrequencyType = 'once' | 'monthly' | 'yearly'
export type CartFrequencyType = 'once' | 'monthly' | 'multiple'
