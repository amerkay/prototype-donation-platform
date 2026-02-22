/**
 * Donor Portal Types
 *
 * Transaction types compatible with Stripe PaymentIntent and PayPal Order.
 * Supports one-time payments and subscription billing records.
 * For subscription types, see ~/features/subscriptions/shared/types
 */

export type PaymentProcessor = 'stripe' | 'paypal'

export type PaymentMethodType = 'card' | 'paypal' | 'bank_transfer'

export type TransactionStatus = 'succeeded' | 'pending' | 'failed' | 'refunded'

export type LegalBasis =
  | 'contractual_necessity'
  | 'legal_obligation'
  | 'consent'
  | 'legitimate_interest'

export interface PaymentMethod {
  type: PaymentMethodType
  /** Card last 4 digits (card only) */
  last4?: string
  /** Card brand: visa, mastercard, amex (card only) */
  brand?: string
  /** PayPal email (paypal only) */
  email?: string
}

/**
 * A line item within a transaction or subscription.
 * Maps to Impact Cart's CartItem structure.
 */
export interface TransactionLineItem {
  productId: string
  productTitle: string
  quantity: number
  unitPrice: number
  frequency: 'once' | 'monthly' | 'yearly'
  certificatePdfUrl?: string
}

/**
 * A single payment transaction (one-time or subscription billing).
 * Models Stripe PaymentIntent / PayPal Order.
 */
export interface Transaction {
  id: string
  processor: PaymentProcessor
  /** Stripe: pi_xxx, PayPal: PAYID-xxx */
  processorTransactionId: string
  type: 'one_time' | 'subscription_payment' | 'refund'
  /** Links to Subscription.id if type is subscription_payment */
  subscriptionId?: string
  campaignId: string
  campaignName: string
  charityName: string

  lineItems: TransactionLineItem[]

  subtotal: number
  coverCostsAmount: number
  totalAmount: number
  currency: string
  /** Org base currency at time of transaction */
  baseCurrency: string
  /** Exchange rate used: 1 original currency = X base currency */
  exchangeRate: number

  paymentMethod: PaymentMethod
  status: TransactionStatus

  donorId: string
  donorName: string
  donorEmail: string
  isAnonymous: boolean
  message?: string
  tribute?: {
    type: 'gift' | 'memorial'
    honoreeName: string
  }
  /** Gift Aid (HMRC compliance) */
  giftAid: boolean
  giftAidAmount?: number
  giftAidDeclarationId?: string
  donorAddress?: {
    line1: string
    line2?: string
    city: string
    region?: string
    postcode: string
    country: string
  }

  /** Refund tracking (type='refund' only) */
  refundOfTransactionId?: string
  giftAidReversed?: boolean
  giftAidAmountReversed?: number

  /** Compliance */
  legalBasis: LegalBasis
  anonymizedAt?: string
  receiptPdfUrl?: string

  customFields?: Record<string, string>

  createdAt: string
  receiptUrl?: string
}

/**
 * HMRC Gift Aid declaration record.
 * One declaration can cover all past and future donations from a donor.
 */
export interface GiftAidDeclaration {
  id: string
  organizationId: string
  donorUserId: string
  donorName: string
  donorEmail: string
  donorAddress: {
    line1: string
    line2?: string
    city: string
    region?: string
    postcode: string
    country: string
  }
  declaredAt: string
  coversFrom?: string
  /** Omitted or undefined = covers all future donations */
  coversTo?: string
  isActive: boolean
  cancelledAt?: string
  createdAt: string
}

/**
 * GDPR consent record — audit log for every opt-in/out event.
 */
export interface ConsentRecord {
  id: string
  organizationId: string
  donorUserId: string
  donorEmail: string
  purpose: 'marketing_email'
  granted: boolean
  legalBasis: LegalBasis
  sourceFormId?: string
  wordingShown: string
  recordedAt: string
  ipAddress?: string
}
