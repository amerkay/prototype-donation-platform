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

export interface TributeData {
  type: 'none' | 'gift' | 'memorial'
  honoree?: {
    firstName: string
    lastName: string
    relationship: string
  }
  eCard?: {
    send: boolean
    recipient?: {
      firstName: string
      lastName: string
      email: string
    }
  }
}

export interface CartItem extends Product {
  addedAt: number
  quantity?: number
  tribute?: TributeData
}

export type FrequencyType = 'once' | 'monthly' | 'yearly'
export type CartFrequencyType = 'once' | 'monthly' | 'multiple'
