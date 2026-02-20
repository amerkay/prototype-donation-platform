import { useEmailTemplateStore } from '~/features/templates/admin/stores/emailTemplate'
import { useCharitySettingsStore } from '~/features/settings/admin/stores/charitySettings'
import { EMAIL_TEMPLATE_META } from '~/features/templates/admin/email-templates'
import { processTemplateRichText } from '~/features/templates/admin/utils/template-rich-text'
import { EMAIL_CARD_TOKENS, type EmailCardsPayload } from '~/emails/components/cards/types'
import { useEmailPreviewContext } from '~/features/templates/admin/composables/useEmailPreviewContext'

/** Make a relative URL absolute using the site URL */
function toAbsoluteUrl(url: string, siteUrl: string): string {
  if (!url || url.startsWith('http://') || url.startsWith('https://') || url.startsWith('data:'))
    return url
  return `${siteUrl.replace(/\/$/, '')}${url.startsWith('/') ? '' : '/'}${url}`
}

function normalizeCardTokenPlaceholders(html: string): string {
  let normalized = html
  for (const token of EMAIL_CARD_TOKENS) {
    const replacement = `{{ ${token} }}`
    normalized = normalized.replace(
      new RegExp(`<span data-variable="${token}">[^<]*<\\/span>`, 'g'),
      replacement
    )
    normalized = normalized.replace(
      new RegExp(
        `<p[^>]*>\\s*(?:<br\\s*\\/?\\s*>\\s*)*(?:&nbsp;\\s*)*\\{\\{\\s*${token}\\s*\\}\\}(?:\\s*&nbsp;)*(?:\\s*<br\\s*\\/?\\s*>)*\\s*<\\/p>`,
        'gi'
      ),
      replacement
    )
    normalized = normalized.replace(new RegExp(`\\{\\{\\s*${token}\\s*\\}\\}`, 'g'), replacement)
  }
  return normalized
}

/** Payload shape sent to the server for rendering/sending */
export interface EmailRenderPayload {
  bodyHtml: string
  imageUrl?: string
  cards?: EmailCardsPayload
  signatureText?: string
  subject: string
  fromName: string
  fromEmail: string
}

export function useEmailRenderPayload() {
  const store = useEmailTemplateStore()
  const charityStore = useCharitySettingsStore()
  const { sampleVariablesByCategory, cards } = useEmailPreviewContext(computed(() => store.type))
  const siteUrl = useRuntimeConfig().public.siteUrl as string
  const meta = computed(() => EMAIL_TEMPLATE_META[store.type])

  const sampleVars = computed(() => sampleVariablesByCategory.value[meta.value.category])

  const resolvedSubject = computed(() => {
    let subject = store.subject || 'No subject'
    for (const [key, value] of Object.entries(sampleVars.value)) {
      subject = subject.replace(new RegExp(`\\{\\{\\s*${key}\\s*\\}\\}`, 'g'), value)
    }
    return subject
  })

  const fromName = computed(() => charityStore.emailSenderName)
  const fromEmail = computed(() => charityStore.emailSenderAddress)

  const signatureText = computed(() => {
    const text = charityStore.emailSignature?.trim()
    return text || undefined
  })

  const processedBodyHtml = computed(() => {
    const html = processTemplateRichText(store.bodyHtml || '', sampleVars.value)
    return normalizeCardTokenPlaceholders(html)
  })

  const payload = computed<EmailRenderPayload>(() => ({
    bodyHtml: processedBodyHtml.value,
    imageUrl:
      meta.value.hasImage && store.imageUrl ? toAbsoluteUrl(store.imageUrl, siteUrl) : undefined,
    cards: cards.value,
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
