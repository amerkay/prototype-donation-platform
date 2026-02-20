import type { CustomFieldDefinition } from '~/features/_library/custom-fields/types'

/**
 * Core donation form configuration types
 * These types define the main form settings, localization, and pricing structure
 */

// ==================== Form Type System ====================

export type FormType = 'donation' | 'registration'

export interface FormTypeLabels {
  addToCartLabel: string
  updateCartLabel: string
  addMoreLabel: string
  totalLabel: string
  emptyCartTitle: string
  emptyCartAction: string
  completeCta: string
  frequencyLabel: string
  modalTitle: string
  reviewTitle: string
  confirmationTitle: string
  confirmationMessage: string
  restartLabel: string
}

export const FORM_TYPE_DEFAULTS: Record<FormType, FormTypeLabels> = {
  donation: {
    addToCartLabel: 'Add to Cart',
    updateCartLabel: 'Update',
    addMoreLabel: 'Add more to cart',
    totalLabel: "Today's Total",
    emptyCartTitle: 'Your cart is empty',
    emptyCartAction: 'Add items to cart',
    completeCta: 'Complete Donation',
    frequencyLabel: 'donation',
    modalTitle: 'Add Items to Your Donation',
    reviewTitle: 'Review Your Donation',
    confirmationTitle: 'Thank you, {name}!',
    confirmationMessage: 'Your {amount} donation has been processed successfully.',
    restartLabel: 'Make Another Donation'
  },
  registration: {
    addToCartLabel: 'Add Entry',
    updateCartLabel: 'Update Entry',
    addMoreLabel: 'Add another entry',
    totalLabel: 'Total',
    emptyCartTitle: 'No entries yet',
    emptyCartAction: 'Add your first entry',
    completeCta: 'Complete Registration',
    frequencyLabel: 'entry',
    modalTitle: 'Browse Entries',
    reviewTitle: 'Review Your Registration',
    confirmationTitle: 'Registration confirmed, {name}!',
    confirmationMessage: 'Your {amount} registration has been processed successfully.',
    restartLabel: 'Register Again'
  }
}

/**
 * Map of feature keys to the form types that support them.
 * Features not listed here are supported by all form types.
 */
export const FEATURE_FORM_TYPE_SUPPORT: Record<string, FormType[]> = {
  donationAmounts: ['donation'],
  productSelector: ['donation'],
  tribute: ['donation'],
  impactBoost: ['donation'],
  entryFields: ['registration']
}

export interface EntryFieldsSettings {
  enabled: boolean
  mode: 'shared' | 'per-item'
  fields: CustomFieldDefinition[]
}

export interface FormSettings {
  title: string
  subtitle: string
  formType?: FormType
}

export interface LocalizationSettings {
  supportedCurrencies: string[]
}

/**
 * Preset amount configuration
 * Supports both simple number format (backward compatible) and rich format with descriptions
 */
export interface PresetAmount {
  amount: number
  shortText?: string // Max 30 chars - short description
  image?: string // Base64 or URL for square image
}

export interface FrequencySettings {
  enabled: boolean
  label: string
  enableAmountDescriptions?: boolean // Toggle to enable descriptions per amount
  presetAmounts: PresetAmount[] // Always object format for consistency
  customAmount: {
    min: number
    max: number
  }
}

export interface DonationAmountsSettings {
  baseDefaultCurrency: string
  enabledCurrencies?: string[]
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
