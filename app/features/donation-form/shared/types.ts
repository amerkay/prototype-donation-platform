import type { CustomFieldDefinition } from '~/features/_library/custom-fields/types'

/**
 * Core donation form configuration types
 * These types define the main form settings, localization, and pricing structure
 */

export interface FormSettings {
  title: string
  subtitle: string
}

export interface LocalizationSettings {
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
  baseDefaultCurrency: string
  frequencies: {
    once: FrequencySettings
    monthly: FrequencySettings
    yearly: FrequencySettings
  }
}

/**
 * Donation form custom fields configuration
 * Maps custom fields to specific donation flow steps (step2, step3) and hidden fields
 */
export interface DonationCustomFieldsSettings {
  customFieldsTabs: {
    step2?: {
      enabled: boolean
      fields: CustomFieldDefinition[]
    }
    step3?: {
      enabled: boolean
      fields: CustomFieldDefinition[]
    }
    hidden?: {
      enabled: boolean
      fields: CustomFieldDefinition[]
    }
  }
}
