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

// FormConfig - API Response Type
export interface FormConfig {
  version: string
  form: {
    title: string
    subtitle: string
  }
  localization: {
    defaultCurrency: string
    supportedCurrencies: ReadonlyArray<{
      code: string
      label: string
      symbol: string
    }>
  }
  pricing: {
    baseCurrency: string
    frequencies: ReadonlyArray<{
      value: 'once' | 'monthly' | 'yearly'
      label: string
      presetAmounts: readonly number[]
      customAmount: { min: number; max: number }
    }>
  }
  features: {
    multipleItems: {
      enabled: boolean
      initialDisplay: number
      ui: {
        title: string
        searchPlaceholder: string
        showMoreButtonTemplate: string
        emptyStateTemplate: string
      }
    }
    adoption: {
      enabled: boolean
      config: {
        icon: string
        entity: { singular: string; plural: string }
        action: { verb: string; noun: string }
        ui: {
          buttonText: string
          buttonTextOnce: string
          modalTitle: string
          modalDescriptionTemplate: string
          noProductsTemplate: string
        }
      }
    }
    bonusItems: {
      enabled: boolean
      ui: {
        labels: {
          freeGifts: string
          freeWithDonation: string
          frequencies: { once: string; monthly: string; yearly: string }
        }
        templates: {
          unlockSingle: string
          unlockPair: string
          unlockList: string
          switchFrequency: string
        }
      }
    }
    shipping: {
      showNotice: boolean
      noticeText: string
    }
  }
}
