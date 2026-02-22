/**
 * Email template metadata: display names, categories, and available variables.
 * Separated from types.ts because these are runtime constants, not type definitions.
 */

import type { RichTextVariable } from '~/features/_library/form-builder/types'
import type { EmailTemplateType, EmailTemplateMeta, EmailTemplateCategory } from './types'

const v = (value: string, label: string): RichTextVariable => ({ value, label })

const VARS = {
  FIRST_NAME: v('FIRST_NAME', 'First Name'),
  LAST_NAME: v('LAST_NAME', 'Last Name'),
  DONOR_NAME: v('DONOR_NAME', 'Donor Name'),
  AMOUNT: v('AMOUNT', 'Amount'),
  DATE: v('DATE', 'Date'),
  HONOREE_NAME: v('HONOREE_NAME', 'Honoree Name'),
  CAMPAIGN_NAME: v('CAMPAIGN_NAME', 'Campaign Name'),
  FREQUENCY: v('FREQUENCY', 'Frequency'),
  NEXT_BILLING_DATE: v('NEXT_BILLING_DATE', 'Next Billing Date'),
  IMPACT_PRODUCT_CARD: v('IMPACT_PRODUCT_CARD', 'Impact Product Card'),
  DONATION_SUMMARY_CARD: v('DONATION_SUMMARY_CARD', 'Donation Summary Card'),
  SUBSCRIPTION_STATUS_CARD: v('SUBSCRIPTION_STATUS_CARD', 'Subscription Status Card'),
  ORDER_BREAKDOWN_CARD: v('ORDER_BREAKDOWN_CARD', 'Order Breakdown Card'),
  PAYMENT_RETRY_CARD: v('PAYMENT_RETRY_CARD', 'Payment Retry Card'),
  PAYMENT_METHOD_CARD: v('PAYMENT_METHOD_CARD', 'Payment Method Card'),
  CAMPAIGN_CONTEXT_CARD: v('CAMPAIGN_CONTEXT_CARD', 'Campaign Context Card')
} as const

const { FIRST_NAME, LAST_NAME, AMOUNT, DATE, DONOR_NAME, FREQUENCY } = VARS
const { CAMPAIGN_NAME, NEXT_BILLING_DATE, HONOREE_NAME } = VARS
const {
  IMPACT_PRODUCT_CARD,
  DONATION_SUMMARY_CARD,
  SUBSCRIPTION_STATUS_CARD,
  ORDER_BREAKDOWN_CARD,
  PAYMENT_RETRY_CARD,
  PAYMENT_METHOD_CARD,
  CAMPAIGN_CONTEXT_CARD
} = VARS

export const EMAIL_TEMPLATE_META: Record<EmailTemplateType, EmailTemplateMeta> = {
  'ecard-gift': {
    displayName: 'eCard: Gift',
    category: 'ecard',
    hasImage: true,
    variables: [
      FIRST_NAME,
      LAST_NAME,
      DONOR_NAME,
      AMOUNT,
      DATE,
      HONOREE_NAME,
      IMPACT_PRODUCT_CARD,
      CAMPAIGN_CONTEXT_CARD
    ]
  },
  'ecard-in-memory': {
    displayName: 'eCard: In Memory',
    category: 'ecard',
    hasImage: true,
    variables: [
      FIRST_NAME,
      LAST_NAME,
      DONOR_NAME,
      AMOUNT,
      DATE,
      HONOREE_NAME,
      IMPACT_PRODUCT_CARD,
      CAMPAIGN_CONTEXT_CARD
    ]
  },
  'donor-donation-success': {
    displayName: 'Donation Success',
    category: 'donor',
    hasImage: true,
    variables: [
      FIRST_NAME,
      LAST_NAME,
      AMOUNT,
      DATE,
      CAMPAIGN_NAME,
      DONATION_SUMMARY_CARD,
      ORDER_BREAKDOWN_CARD,
      CAMPAIGN_CONTEXT_CARD,
      IMPACT_PRODUCT_CARD
    ]
  },
  'donor-new-subscription': {
    displayName: 'New Subscription',
    category: 'donor',
    hasImage: false,
    variables: [
      FIRST_NAME,
      LAST_NAME,
      AMOUNT,
      FREQUENCY,
      NEXT_BILLING_DATE,
      SUBSCRIPTION_STATUS_CARD,
      ORDER_BREAKDOWN_CARD,
      PAYMENT_METHOD_CARD,
      IMPACT_PRODUCT_CARD
    ]
  },
  'donor-subscription-paused': {
    displayName: 'Subscription Paused',
    category: 'donor',
    hasImage: false,
    variables: [
      FIRST_NAME,
      LAST_NAME,
      AMOUNT,
      FREQUENCY,
      SUBSCRIPTION_STATUS_CARD,
      IMPACT_PRODUCT_CARD
    ]
  },
  'donor-subscription-resumed': {
    displayName: 'Subscription Resumed',
    category: 'donor',
    hasImage: false,
    variables: [
      FIRST_NAME,
      LAST_NAME,
      AMOUNT,
      FREQUENCY,
      NEXT_BILLING_DATE,
      SUBSCRIPTION_STATUS_CARD,
      IMPACT_PRODUCT_CARD
    ]
  },
  'donor-subscription-cancelled': {
    displayName: 'Subscription Cancelled',
    category: 'donor',
    hasImage: false,
    variables: [FIRST_NAME, LAST_NAME, SUBSCRIPTION_STATUS_CARD, IMPACT_PRODUCT_CARD]
  },
  'donor-payment-failed': {
    displayName: 'Recurring Payment Failed',
    category: 'donor',
    hasImage: false,
    variables: [
      FIRST_NAME,
      LAST_NAME,
      AMOUNT,
      FREQUENCY,
      PAYMENT_RETRY_CARD,
      PAYMENT_METHOD_CARD,
      SUBSCRIPTION_STATUS_CARD,
      IMPACT_PRODUCT_CARD
    ]
  }
} as const

/** Get the category for a template type */
export function getCategoryForType(type: EmailTemplateType): EmailTemplateCategory {
  return EMAIL_TEMPLATE_META[type].category
}

/** Category display labels */
export const EMAIL_CATEGORY_LABELS: Record<EmailTemplateCategory, string> = {
  ecard: 'eCards',
  donor: 'Donor'
}
