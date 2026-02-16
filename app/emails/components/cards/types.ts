export const EMAIL_CARD_TOKENS = [
  'IMPACT_PRODUCT_CARD',
  'DONATION_SUMMARY_CARD',
  'SUBSCRIPTION_STATUS_CARD',
  'ORDER_BREAKDOWN_CARD',
  'PAYMENT_RETRY_CARD',
  'PAYMENT_METHOD_CARD',
  'CAMPAIGN_CONTEXT_CARD'
] as const

export type EmailCardToken = (typeof EMAIL_CARD_TOKENS)[number]

export interface EmailImpactProductCardData {
  name: string
  description: string
  imageUrl?: string
}

export interface EmailDonationSummaryCardData {
  amount: string
  date: string
  frequency?: string
  campaignName?: string
  reference?: string
}

export interface EmailSubscriptionStatusCardData {
  status: string
  amount?: string
  frequency?: string
  nextBillingDate?: string
  effectiveDate?: string
}

export interface EmailOrderBreakdownItem {
  name: string
  quantity?: number
  amount?: string
  imageUrl?: string
}

export interface EmailOrderBreakdownCardData {
  items: EmailOrderBreakdownItem[]
  total?: string
  frequency?: string
}

export interface EmailPaymentRetryCardData {
  amount?: string
  failedDate?: string
  retryDate?: string
  actionText?: string
  portalUrl?: string
  portalLinkText?: string
  buttonBackgroundColor?: string
}

export interface EmailPaymentMethodCardData {
  methodLabel?: string
  expiry?: string
  billingContact?: string
  actionText?: string
  portalUrl?: string
  portalLinkText?: string
  buttonBackgroundColor?: string
}

export interface EmailCampaignContextCardData {
  campaignName?: string
  description: string
  imageUrl?: string
  campaignUrl?: string
  buttonBackgroundColor?: string
}

export interface EmailCardsPayload {
  IMPACT_PRODUCT_CARD?: EmailImpactProductCardData
  DONATION_SUMMARY_CARD?: EmailDonationSummaryCardData
  SUBSCRIPTION_STATUS_CARD?: EmailSubscriptionStatusCardData
  ORDER_BREAKDOWN_CARD?: EmailOrderBreakdownCardData
  PAYMENT_RETRY_CARD?: EmailPaymentRetryCardData
  PAYMENT_METHOD_CARD?: EmailPaymentMethodCardData
  CAMPAIGN_CONTEXT_CARD?: EmailCampaignContextCardData
}

export type EmailCardSegment =
  | { kind: 'html'; html: string }
  | { kind: 'card'; token: EmailCardToken; data: NonNullable<EmailCardsPayload[EmailCardToken]> }

export function isEmailCardToken(value: string): value is EmailCardToken {
  return EMAIL_CARD_TOKENS.includes(value as EmailCardToken)
}
