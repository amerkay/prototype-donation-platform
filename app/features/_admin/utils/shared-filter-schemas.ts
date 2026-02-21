import type { ContextSchema } from '~/features/_library/form-builder/conditions/types'

/**
 * Shared filter schema for subscription-related fields.
 * Used in donation and donor filters with 'subscription.' prefix.
 */
export const SUBSCRIPTION_FILTER_SCHEMA: ContextSchema = {
  'subscription.status': {
    label: 'Status',
    type: 'string',
    group: 'Related Subscription',
    options: [
      { value: 'active', label: 'Active' },
      { value: 'paused', label: 'Paused' },
      { value: 'cancelled', label: 'Cancelled' }
    ]
  },
  'subscription.frequency': {
    label: 'Frequency',
    type: 'string',
    group: 'Related Subscription',
    options: [
      { value: 'monthly', label: 'Monthly' },
      { value: 'yearly', label: 'Yearly' }
    ]
  },
  'subscription.amount': {
    label: 'Amount',
    type: 'number',
    group: 'Related Subscription'
  }
}

/**
 * Shared filter schema for payment method field.
 * Used with different prefixes: 'paymentMethod.type' or 'donation.paymentMethod.type'
 */
export const PAYMENT_METHOD_FILTER_OPTIONS = [
  { value: 'card', label: 'Card' },
  { value: 'paypal', label: 'PayPal' },
  { value: 'bank_transfer', label: 'Bank Transfer' }
]

/**
 * Shared filter schema for donation status field.
 * Used with different prefixes: 'status' or 'donation.status'
 */
export const DONATION_STATUS_FILTER_OPTIONS = [
  { value: 'succeeded', label: 'Succeeded' },
  { value: 'pending', label: 'Pending' },
  { value: 'failed', label: 'Failed' },
  { value: 'refunded', label: 'Refunded' }
]

/**
 * Shared filter schema for donation type field.
 * Used with different prefixes: 'type' or 'donation.type'
 */
export const DONATION_TYPE_FILTER_OPTIONS = [
  { value: 'one_time', label: 'One-time' },
  { value: 'subscription_payment', label: 'Subscription' }
]

/**
 * Shared filter schema for donor-related fields.
 * Used in donation and donor filters with 'donor.' prefix or direct accessor.
 */
export const DONOR_FILTER_SCHEMA: ContextSchema = {
  'donor.totalDonated': { label: 'Total Donated', type: 'number', group: 'Related Donor' },
  'donor.donationCount': { label: 'Donation Count', type: 'number', group: 'Related Donor' },
  'donor.giftAid': { label: 'Gift Aid Eligible', type: 'boolean', group: 'Related Donor' }
}
