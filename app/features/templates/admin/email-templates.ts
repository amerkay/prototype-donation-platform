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
  FUNDRAISER_NAME: v('FUNDRAISER_NAME', 'Fundraiser Name'),
  GOAL_AMOUNT: v('GOAL_AMOUNT', 'Goal Amount'),
  TOTAL_RAISED: v('TOTAL_RAISED', 'Total Raised'),
  INVITEE_NAME: v('INVITEE_NAME', 'Invitee Name'),
  ROLE: v('ROLE', 'Role'),
  ORG_NAME: v('ORG_NAME', 'Organisation Name'),
  INVITE_LINK: v('INVITE_LINK', 'Invite Link'),
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
  },
  'admin-new-donation': {
    displayName: 'New Donation',
    category: 'admin',
    hasImage: false,
    variables: [DONOR_NAME, AMOUNT, DATE, CAMPAIGN_NAME, FREQUENCY, DONATION_SUMMARY_CARD]
  },
  'admin-new-p2p-fundraiser': {
    displayName: 'New P2P Fundraiser',
    category: 'admin',
    hasImage: false,
    variables: [VARS.FUNDRAISER_NAME, CAMPAIGN_NAME, VARS.GOAL_AMOUNT]
  },
  'p2p-new-donation': {
    displayName: 'New Donation',
    category: 'p2p',
    hasImage: false,
    variables: [DONOR_NAME, AMOUNT, VARS.FUNDRAISER_NAME, VARS.TOTAL_RAISED]
  },
  'team-invitation': {
    displayName: 'Team Invitation',
    category: 'team',
    hasImage: false,
    variables: [VARS.INVITEE_NAME, VARS.ROLE, VARS.ORG_NAME, VARS.INVITE_LINK]
  }
} as const

/** Get the category for a template type */
export function getCategoryForType(type: EmailTemplateType): EmailTemplateCategory {
  return EMAIL_TEMPLATE_META[type].category
}

/** Category display labels */
export const EMAIL_CATEGORY_LABELS: Record<EmailTemplateCategory, string> = {
  ecard: 'eCards',
  donor: 'Donor',
  admin: 'Admin',
  p2p: 'P2P',
  team: 'Team'
}
