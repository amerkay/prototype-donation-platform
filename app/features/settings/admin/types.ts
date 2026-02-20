/**
 * Organization-level settings types
 */

export interface CurrencySettings {
  supportedCurrencies: string[]
  defaultCurrency: string
  currencyMultipliers: Record<string, number>
}

/**
 * Per-currency charity override (e.g., different registration in another country)
 */
export interface CharityCurrencyOverride {
  enabled: boolean
  name?: string
  registrationNumber?: string
  phone?: string
  replyToEmail?: string
  website?: string
  description?: string
  address?: CharityAddress
}

/**
 * Structured charity address
 */
export interface CharityAddress {
  address1: string
  address2: string
  city: string
  region: string
  postcode: string
  country: string
}

/**
 * Organization-level charity settings
 */
export interface CharitySettings {
  slug: string
  name: string
  registrationNumber: string
  phone: string
  replyToEmail: string
  address: CharityAddress
  website: string
  description: string
  emailSenderId: string
  emailSenderName: string
  emailSenderAddress: string
  emailSignature: string
  currencyOverrides: Record<string, CharityCurrencyOverride>
}

/** Override-eligible fields (excludes address, handled separately) */
export const CHARITY_OVERRIDE_FIELDS = [
  'name',
  'registrationNumber',
  'phone',
  'replyToEmail',
  'website',
  'description'
] as const

/** Address fields for override checking (top-level in form address group) */
export const CHARITY_ADDRESS_FIELDS = ['address1', 'city', 'country'] as const

/** Address fields nested inside group1 in the form */
export const CHARITY_ADDRESS_GROUP_FIELDS = ['region', 'postcode'] as const

/** All scalar string fields on CharitySettings (excludes address, currencyOverrides) */
export const CHARITY_STORE_FIELDS = [
  'slug',
  'name',
  'registrationNumber',
  'phone',
  'replyToEmail',
  'website',
  'description',
  'emailSenderId',
  'emailSenderName',
  'emailSenderAddress',
  'emailSignature'
] as const

/**
 * General organization settings
 */
export interface GeneralSettings {
  timezone: string
  dateFormat: string
}

/**
 * Branding settings
 */
export interface BrandingSettings {
  logoUrl: string
  primaryColor: string
  secondaryColor: string
  fontFamily: string
  customCss: string
}

/**
 * Payment processor connection settings (OAuth-based)
 */
export interface PaymentProcessorSettings {
  stripe: {
    testMode: boolean
    connected: boolean
    accountId?: string
    connectedAt?: string
  }
  paypal: {
    testMode: boolean
    connected: boolean
    merchantId?: string
    connectedAt?: string
  }
}

/**
 * Team member
 */
export interface TeamMember {
  id: string
  name: string
  email: string
  role: 'owner' | 'admin' | 'editor' | 'viewer'
  status: 'active' | 'invited' | 'disabled'
  joinedAt: string
  lastActiveAt: string
}

/**
 * Team settings
 */
export interface TeamSettings {
  members: TeamMember[]
}

/**
 * Monthly billing statement
 */
export interface BillingStatement {
  id: string
  month: string
  paymentCount: number
  totalIncome: number
  platformFee: number
  tax: number
  total: number
  status: 'paid' | 'pending' | 'overdue'
  paidAt?: string
}

/**
 * Payment card on file
 */
export interface PaymentCard {
  brand: string
  last4: string
  expMonth: number
  expYear: number
}

/**
 * Billing settings — 3% flat fee model
 */
export interface BillingSettings {
  billingEmail: string
  paymentCard?: PaymentCard
  statements: BillingStatement[]
  taxRate: number
}

/**
 * API & Webhook settings
 */
export interface ApiSettings {
  apiKeys: {
    id: string
    name: string
    prefix: string
    createdAt: string
    lastUsedAt: string
  }[]
  webhooks: {
    id: string
    url: string
    events: string[]
    enabled: boolean
    createdAt: string
    lastTriggeredAt?: string
  }[]
}
