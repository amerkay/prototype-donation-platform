/**
 * Organization-level settings types
 */

export interface CurrencySettings {
  supportedCurrencies: string[]
  defaultCurrency: string
  currencyMultipliers: Record<string, number>
}

/**
 * Per-currency charity entry (equal status — no enabled toggle, all fully populated)
 */
export interface CharityCurrencyEntry {
  currency: string
  name: string
  registrationNumber: string
  phone: string
  replyToEmail: string
  website: string
  description: string
  address: CharityAddress
  emailSenderId: string
  emailSenderName: string
  emailSenderAddress: string
  emailSignature: string
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
 * Per-currency details stored as equal entries in currencyEntries record.
 */
export interface CharitySettings {
  slug: string
  currencyEntries: Record<string, CharityCurrencyEntry>
}

/** Per-currency entry fields (excludes address, handled separately) */
export const CHARITY_ENTRY_FIELDS = [
  'name',
  'registrationNumber',
  'phone',
  'replyToEmail',
  'website',
  'description'
] as const

/** Address fields for content checking (top-level in form address group) */
export const CHARITY_ADDRESS_FIELDS = ['address1', 'city', 'country'] as const

/** Address fields nested inside group1 in the form */
export const CHARITY_ADDRESS_GROUP_FIELDS = ['region', 'postcode'] as const

/** Per-currency entry fields including email sender (excludes address) */
export const CHARITY_ENTRY_ALL_FIELDS = [
  ...CHARITY_ENTRY_FIELDS,
  'emailSenderId',
  'emailSenderName',
  'emailSenderAddress',
  'emailSignature'
] as const

/** Org-level scalar fields on CharitySettings (not per-currency) */
export const CHARITY_ORG_FIELDS = ['slug'] as const

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
