/**
 * Donor Portal Types
 *
 * Transaction and subscription types compatible with:
 * - Stripe (PaymentIntent, Subscription) and PayPal (Order, BillingAgreement)
 * - One-time payments, recurring subscriptions
 * - Impact Cart multi-item checkouts (multiple items with mixed frequencies)
 */

export type PaymentProcessor = 'stripe' | 'paypal'

export type PaymentMethodType = 'card' | 'paypal' | 'bank_transfer'

export type TransactionStatus = 'succeeded' | 'pending' | 'failed' | 'refunded'

export type SubscriptionStatus = 'active' | 'paused' | 'cancelled' | 'past_due'

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

  lineItems: TransactionLineItem[]

  subtotal: number
  coverCostsAmount: number
  totalAmount: number
  currency: string

  paymentMethod: PaymentMethod
  status: TransactionStatus

  donorName: string
  donorEmail: string
  isAnonymous: boolean
  message?: string
  tribute?: {
    type: 'gift' | 'memorial'
    honoreeName: string
  }
  giftAid: boolean

  createdAt: string
  receiptUrl?: string
}

/**
 * A recurring subscription.
 * Models Stripe Subscription / PayPal Billing Agreement.
 */
export interface Subscription {
  id: string
  processor: PaymentProcessor
  /** Stripe: sub_xxx, PayPal: I-xxx */
  processorSubscriptionId: string
  campaignId: string
  campaignName: string

  lineItems: TransactionLineItem[]

  amount: number
  currency: string
  frequency: 'monthly' | 'yearly'

  paymentMethod: PaymentMethod
  status: SubscriptionStatus

  currentPeriodStart: string
  currentPeriodEnd: string
  nextBillingDate?: string
  cancelledAt?: string
  pausedAt?: string

  createdAt: string

  totalPaid: number
  paymentCount: number
}
