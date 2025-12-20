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
    isIncludeMessage?: boolean
    message?: string
  }
}

export interface CartItem extends Product {
  addedAt: number
  quantity?: number
  tribute?: TributeData
}

export type FrequencyType = 'once' | 'monthly' | 'yearly'
export type CartFrequencyType = 'once' | 'monthly' | 'multiple'

// FormConfig - API Response Type
export interface FormConfig {
  version: string
  form: {
    title: string
    subtitle: string
  }
  localization: {
    defaultCurrency: string
    supportedCurrencies: readonly string[]
  }
  pricing: {
    baseCurrency: string
    frequencies: {
      once: {
        enabled: boolean
        label: string
        presetAmounts: readonly number[]
        customAmount: { min: number; max: number }
      }
      monthly: {
        enabled: boolean
        label: string
        presetAmounts: readonly number[]
        customAmount: { min: number; max: number }
      }
      yearly: {
        enabled: boolean
        label: string
        presetAmounts: readonly number[]
        customAmount: { min: number; max: number }
      }
    }
  }
  features: {
    impactCart: {
      enabled: boolean
      initialDisplay: number
    }
    productSelector: {
      enabled: boolean
      config: {
        icon: string
        entity: { singular: string; plural: string }
        action: { verb: string; noun: string }
      }
    }
    rewards: {
      enabled: boolean
      ui: {
        labels: {
          freeGifts: string
          freeWithDonation: string
        }
      }
    }
    shippingNotice: {
      showNotice: boolean
      noticeText: string
    }
    coverCosts: {
      enabled: boolean
      heading: string
      description: string
    }
    tribute: {
      enabled: boolean
      icons: {
        gift: string
        memorial: string
        tribute: string
      }
      types: {
        none: { label: string }
        giftEnabled: boolean
        memorialEnabled: boolean
      }
      relationships: ReadonlyArray<{
        value: string
        label: string
      }>
      modal: {
        title: string
        subtitle: string
      }
    }
  }
}
