import type { Component } from 'vue'
import EmailImpactProductCard from '~/emails/components/cards/EmailImpactProductCard.vue'
import EmailDonationSummaryCard from '~/emails/components/cards/EmailDonationSummaryCard.vue'
import EmailSubscriptionStatusCard from '~/emails/components/cards/EmailSubscriptionStatusCard.vue'
import EmailOrderBreakdownCard from '~/emails/components/cards/EmailOrderBreakdownCard.vue'
import EmailPaymentRetryCard from '~/emails/components/cards/EmailPaymentRetryCard.vue'
import EmailPaymentMethodCard from '~/emails/components/cards/EmailPaymentMethodCard.vue'
import EmailCampaignContextCard from '~/emails/components/cards/EmailCampaignContextCard.vue'
import {
  isEmailCardToken,
  type EmailCardsPayload,
  type EmailCardSegment,
  type EmailCardToken
} from '~/emails/components/cards/types'

export const EMAIL_CARD_COMPONENTS: Record<EmailCardToken, Component> = {
  IMPACT_PRODUCT_CARD: EmailImpactProductCard,
  DONATION_SUMMARY_CARD: EmailDonationSummaryCard,
  SUBSCRIPTION_STATUS_CARD: EmailSubscriptionStatusCard,
  ORDER_BREAKDOWN_CARD: EmailOrderBreakdownCard,
  PAYMENT_RETRY_CARD: EmailPaymentRetryCard,
  PAYMENT_METHOD_CARD: EmailPaymentMethodCard,
  CAMPAIGN_CONTEXT_CARD: EmailCampaignContextCard
}

const TEMPLATE_TOKEN_REGEX = /\{\{\s*([A-Z0-9_]+)\s*\}\}/g

export function splitBodyIntoCardSegments(
  sanitizedHtml: string,
  cards?: EmailCardsPayload
): EmailCardSegment[] {
  const segments: EmailCardSegment[] = []
  let cursor = 0

  for (const match of sanitizedHtml.matchAll(TEMPLATE_TOKEN_REGEX)) {
    const fullMatch = match[0]
    const token = match[1]
    const index = match.index ?? 0

    if (index > cursor) {
      segments.push({ kind: 'html', html: sanitizedHtml.slice(cursor, index) })
    }

    if (!token) {
      segments.push({ kind: 'html', html: fullMatch })
      cursor = index + fullMatch.length
      continue
    }

    if (isEmailCardToken(token)) {
      const data = cards?.[token]
      if (data) {
        segments.push({ kind: 'card', token, data })
      }
    } else {
      segments.push({ kind: 'html', html: fullMatch })
    }

    cursor = index + fullMatch.length
  }

  if (cursor < sanitizedHtml.length) {
    segments.push({ kind: 'html', html: sanitizedHtml.slice(cursor) })
  }

  return segments
}
