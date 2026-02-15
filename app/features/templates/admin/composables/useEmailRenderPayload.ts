import { useEmailTemplateStore } from '~/features/templates/admin/stores/emailTemplate'
import { useGeneralSettingsStore } from '~/features/settings/admin/stores/generalSettings'
import { useProducts } from '~/features/products/admin/composables/useProducts'
import { EMAIL_TEMPLATE_META } from '~/features/templates/admin/email-templates'
import type { EmailTemplateCategory } from '~/features/templates/admin/types'
import {
  processTemplateRichText,
  escapeHtml
} from '~/features/templates/admin/utils/template-rich-text'

/** Make a relative URL absolute using the site URL */
function toAbsoluteUrl(url: string, siteUrl: string): string {
  if (!url || url.startsWith('http://') || url.startsWith('https://') || url.startsWith('data:'))
    return url
  return `${siteUrl.replace(/\/$/, '')}${url.startsWith('/') ? '' : '/'}${url}`
}

/** Sample variable values per category for realistic preview */
const SAMPLE_VARIABLES: Record<EmailTemplateCategory, Record<string, string>> = {
  ecard: {
    FIRST_NAME: 'Sarah',
    LAST_NAME: 'Johnson',
    DONOR_NAME: 'Sarah Johnson',
    AMOUNT: '$50.00',
    DATE: 'February 14, 2026',
    HONOREE_NAME: 'John Smith'
  },
  donor: {
    FIRST_NAME: 'Sarah',
    LAST_NAME: 'Johnson',
    AMOUNT: '$25.00',
    DATE: 'February 14, 2026',
    CAMPAIGN_NAME: 'Save the Orangutans',
    FREQUENCY: 'monthly',
    NEXT_BILLING_DATE: 'March 14, 2026'
  },
  admin: {
    DONOR_NAME: 'Sarah Johnson',
    AMOUNT: '$100.00',
    DATE: 'February 14, 2026',
    CAMPAIGN_NAME: 'Save the Orangutans',
    FREQUENCY: 'one-time',
    FUNDRAISER_NAME: 'Jane Doe',
    GOAL_AMOUNT: '$5,000'
  },
  p2p: {
    DONOR_NAME: 'Sarah Johnson',
    AMOUNT: '$25.00',
    FUNDRAISER_NAME: 'Jane Doe',
    TOTAL_RAISED: '$1,250.00'
  },
  team: {
    INVITEE_NAME: 'Alex Rivera',
    ROLE: 'Editor',
    ORG_NAME: 'Borneo Orangutan Survival',
    INVITE_LINK: 'https://example.com/invite/abc123'
  }
}

/** Build an inline product card from active products */
function buildProductCardHtml(
  product: { name: string; description: string; image: string | null },
  siteUrl: string
): string {
  const name = escapeHtml(product.name)
  const desc = escapeHtml(
    product.description.slice(0, 60) + (product.description.length > 60 ? '…' : '')
  )
  const imgHtml = product.image
    ? `<img src="${escapeHtml(toAbsoluteUrl(product.image, siteUrl))}" alt="${name}" width="48" height="48" style="width:48px;height:48px;border-radius:6px;object-fit:cover;flex-shrink:0" />`
    : `<div style="width:48px;height:48px;border-radius:6px;background:#e5e7eb;flex-shrink:0"></div>`

  return (
    `<div style="border:1px solid #e5e7eb;border-radius:8px;padding:12px;display:flex;align-items:center;gap:12px;margin:8px 0;background:#f9fafb">` +
    imgHtml +
    `<div><div style="font-size:14px;font-weight:500">${name}</div>` +
    `<div style="font-size:12px;color:#6b7280">${desc}</div></div></div>`
  )
}

/** Payload shape sent to the server for rendering/sending */
export interface EmailRenderPayload {
  bodyHtml: string
  imageUrl?: string
  signatureHtml?: string
  subject: string
  fromName: string
  fromEmail: string
}

/**
 * Composable that prepares the complete email render payload.
 * Used by both EmailPreview (for live preview) and "Send Test Email".
 * All data assembly happens here so preview matches what gets sent.
 */
export function useEmailRenderPayload() {
  const store = useEmailTemplateStore()
  const generalStore = useGeneralSettingsStore()
  const { activeProducts } = useProducts()
  const siteUrl = useRuntimeConfig().public.siteUrl as string
  const meta = computed(() => EMAIL_TEMPLATE_META[store.type])

  const sampleVars = computed(() => SAMPLE_VARIABLES[meta.value.category])

  const resolvedSubject = computed(() => {
    let subject = store.subject || 'No subject'
    for (const [key, value] of Object.entries(sampleVars.value)) {
      subject = subject.replace(new RegExp(`\\{\\{\\s*${key}\\s*\\}\\}`, 'g'), value)
    }
    return subject
  })

  const fromName = computed(() => generalStore.emailSenderName)
  const fromEmail = computed(() => generalStore.emailSenderAddress)

  /** Product card HTML from first active product with image */
  const productCardHtml = computed(() => {
    const product = activeProducts.value.find((p) => p.image) ?? activeProducts.value[0]
    if (!product) return undefined
    return buildProductCardHtml(product, siteUrl)
  })

  /** Signature as inline HTML */
  const signatureHtml = computed(() => {
    if (!generalStore.emailSignature) return undefined
    return `<p style="font-size:14px;color:#6b7280;white-space:pre-line">${escapeHtml(generalStore.emailSignature)}</p>`
  })

  /** Body HTML with all variables + product card replaced */
  const processedBodyHtml = computed(() => {
    let html = processTemplateRichText(store.bodyHtml || '', sampleVars.value)
    if (productCardHtml.value) {
      html = html.replace(/\{\{\s*IMPACT_PRODUCT_CARD\s*\}\}/g, productCardHtml.value)
      html = html.replace(
        new RegExp(`<span data-variable="IMPACT_PRODUCT_CARD">[^<]*</span>`, 'g'),
        productCardHtml.value
      )
    }
    return html
  })

  /** Full payload ready for the server render/send endpoints */
  const payload = computed<EmailRenderPayload>(() => ({
    bodyHtml: processedBodyHtml.value,
    imageUrl:
      meta.value.hasImage && store.imageUrl ? toAbsoluteUrl(store.imageUrl, siteUrl) : undefined,
    signatureHtml: signatureHtml.value,
    subject: resolvedSubject.value,
    fromName: fromName.value,
    fromEmail: fromEmail.value
  }))

  return {
    payload,
    resolvedSubject,
    fromName,
    fromEmail
  }
}
