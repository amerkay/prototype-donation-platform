/**
 * Core donation form configuration types
 * These types define the main form settings, localization, and pricing structure
 */

export interface FormSettings {
  title: string
  subtitle: string
}

export interface LocalizationSettings {
  defaultCurrency: string
  supportedCurrencies: string[]
}

export interface FrequencySettings {
  enabled: boolean
  label: string
  presetAmounts: number[]
  customAmount: {
    min: number
    max: number
  }
}

export interface PricingSettings {
  baseCurrency: string
  frequencies: {
    once: FrequencySettings
    monthly: FrequencySettings
    yearly: FrequencySettings
  }
}
