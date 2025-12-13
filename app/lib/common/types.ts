export interface Product {
    id: string
    name: string
    description: string
    price?: number
    minPrice?: number
    default?: number
    frequency: 'once' | 'weekly' | 'monthly' | 'quarterly' | 'yearly'
    image: string
    thumbnail: string
    icon: string
    isBonusItem?: boolean
    isShippingRequired?: boolean
    bonusThreshold?: {
        once?: number
        weekly?: number
        monthly?: number
        quarterly?: number
        yearly?: number
    }
}

export interface CartItem extends Product {
    addedAt: number
}

export type FrequencyType = 'once' | 'weekly' | 'monthly' | 'quarterly' | 'yearly'
export type CartFrequencyType = 'once' | 'monthly' | 'multiple'
