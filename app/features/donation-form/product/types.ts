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
  isReward?: boolean
  isShippingRequired?: boolean
  rewardThreshold?: {
    once?: number
    monthly?: number
    yearly?: number
  }
}
