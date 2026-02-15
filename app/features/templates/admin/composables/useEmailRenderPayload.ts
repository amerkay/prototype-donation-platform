import { useEmailTemplateStore } from '~/features/templates/admin/stores/emailTemplate'
import { useGeneralSettingsStore } from '~/features/settings/admin/stores/generalSettings'
import { useProducts } from '~/features/products/admin/composables/useProducts'
import { EMAIL_TEMPLATE_META } from '~/features/templates/admin/email-templates'
import type { EmailTemplateCategory } from '~/features/templates/admin/types'
import { processTemplateRichText } from '~/features/templates/admin/utils/template-rich-text'

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

export interface EmailProductCardData {
  name: string
  description: string
  imageUrl?: string
}

/** Payload shape sent to the server for rendering/sending */
export interface EmailRenderPayload {
  bodyHtml: string
  imageUrl?: string
  productCard?: EmailProductCardData
  signatureText?: string
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

  /** Product card data from first active product with image */
  const productCard = computed<EmailProductCardData | undefined>(() => {
    const product = activeProducts.value.find((p) => p.image) ?? activeProducts.value[0]
    if (!product) return undefined
    return {
      name: product.name,
      description: product.description,
      imageUrl: product.image ? toAbsoluteUrl(product.image, siteUrl) : undefined
    }
  })

  /** Signature as plain text (newlines preserved at render-time) */
  const signatureText = computed(() => {
    const text = generalStore.emailSignature?.trim()
    return text || undefined
  })

  /** Body HTML with all variables + product card replaced */
  const processedBodyHtml = computed(() => {
    let html = processTemplateRichText(store.bodyHtml || '', sampleVars.value)
    const replacement = productCard.value ? '{{ IMPACT_PRODUCT_CARD }}' : ''
    html = html.replace(/\{\{\s*IMPACT_PRODUCT_CARD\s*\}\}/g, replacement)
    html = html.replace(
      new RegExp(`<span data-variable="IMPACT_PRODUCT_CARD">[^<]*</span>`, 'g'),
      replacement
    )
    return html
  })

  /** Full payload ready for the server render/send endpoints */
  const payload = computed<EmailRenderPayload>(() => ({
    bodyHtml: processedBodyHtml.value,
    imageUrl:
      meta.value.hasImage && store.imageUrl ? toAbsoluteUrl(store.imageUrl, siteUrl) : undefined,
    productCard: productCard.value,
    signatureText: signatureText.value,
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
