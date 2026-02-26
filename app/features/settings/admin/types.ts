/**
 * Organization-level settings types
 */

export interface CurrencySettings {
  supportedCurrencies: string[]
  defaultCurrency: string
  currencyMultipliers: Record<string, number>
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
 * Flat org-level charity identity
 */
export interface CharityInfo {
  name: string
  registrationNumber: string
  phone: string
  website: string
  description: string
  address: CharityAddress
  emailSenderId: string
  emailSenderName: string
  emailSenderAddress: string
  emailSignature: string
}

/**
 * Organization-level charity settings
 */
export interface CharitySettings {
  slug: string
  charity: CharityInfo
  charityCosts: CharityCostsSettings
  terms: TermsSettings
}

/**
 * Charity operational cost item (for cover costs upsell modal)
 */
export interface CharityCostItem {
  service: string
  purpose: string
  annualCost: string
  currency: string
}

/**
 * Org-level charity costs settings
 */
export interface CharityCostsSettings {
  heading: string
  introText: string
  outroText: string
  costs: CharityCostItem[]
}

/**
 * Org-level terms & conditions settings
 */
export interface TermsSettings {
  enabled: boolean
  settings: {
    mode: 'link' | 'content'
    externalUrl: string
    richContent: string
    label: string
    description: string
  }
}

/** Org-level scalar fields on CharitySettings */
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
  role: 'owner' | 'admin' | 'developer' | 'member'
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
