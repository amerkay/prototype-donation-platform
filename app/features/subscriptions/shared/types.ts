/**
 * Subscription Types
 *
 * Types for recurring subscriptions compatible with Stripe Subscription
 * and PayPal Billing Agreement.
 */

import type {
  PaymentProcessor,
  PaymentMethod,
  TransactionLineItem
} from '~/features/donor-portal/types'

export type SubscriptionStatus = 'active' | 'paused' | 'cancelled' | 'past_due'

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
  charityName: string

  lineItems: TransactionLineItem[]

  amount: number
  currency: string
  baseCurrency: string
  exchangeRate: number
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
