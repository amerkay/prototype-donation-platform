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
  productName: string
  productIcon: string
  quantity: number
  unitPrice: number
  frequency: 'once' | 'monthly' | 'yearly'
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
  type: 'one_time' | 'subscription_payment'
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
  giftAid: boolean
  customFields?: Record<string, string>

  createdAt: string
  receiptUrl?: string
}
