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
    multipleProducts: {
      enabled: boolean
      initialDisplay: number
      ui: {
        label: string
        title: string
        searchPlaceholder: string
        showMoreButtonTemplate: string
        emptyStateTemplate: string
      }
    }
    productSelector: {
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
    rewards: {
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
    shippingNotice: {
      showNotice: boolean
      noticeText: string
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
        gift: { label: string }
        memorial: { label: string }
      }
      form: {
        tributeTypeSection: {
          legend: string
          description: string
        }
        honoreeSection: {
          legendGift: string
          legendMemorial: string
          legendDefault: string
          description: string
          fields: {
            firstName: { label: string; placeholder: string }
            lastName: { label: string; placeholder: string; optional: string }
            relationship: {
              label: string
              placeholder: string
              optional: string
              searchPlaceholder: string
              notFound: string
            }
          }
        }
        eCardSection: {
          toggle: { title: string; description: string }
          recipientSection: {
            legend: string
            description: string
          }
          sameAsHonoree: {
            titleTemplate: string
            description: string
          }
          fields: {
            firstName: { label: string; placeholder: string }
            lastName: { label: string; placeholder: string; optional: string }
            email: { label: string; placeholder: string }
          }
        }
      }
      relationships: ReadonlyArray<{
        value: string
        label: string
      }>
      validation: {
        honoreeFirstName: {
          required: string
          minLength: string
        }
        recipientFirstName: {
          required: string
          minLength: string
        }
        recipientEmail: {
          required: string
          invalid: string
        }
      }
      modal: {
        title: string
        subtitle: string
        saveButton: string
        cancelButton: string
      }
      card: {
        editButton: string
        removeButton: string
      }
      line: {
        relationshipTemplate: string
        eCardTemplate: string
      }
    }
  }
}
