import { createTransport } from 'nodemailer'
import { sanitizeRichText } from '~~/app/features/_library/form-builder/utils/sanitize-html'

interface SendEmailRequest {
  bodyHtml: string
  imageUrl?: string
  signatureText?: string
  subject: string
  fromName: string
  fromEmail: string
  to: string
}

export default defineEventHandler(async (event) => {
  const body = await readBody<SendEmailRequest>(event)

  if (!body.to || !body.subject) {
    throw createError({ statusCode: 400, statusMessage: 'Missing required fields: to, subject' })
  }

  const rendered = await renderEmailComponent('DonationEmail', {
    bodyHtml: sanitizeRichText(body.bodyHtml || '', { profile: 'email' }),
    imageUrl: body.imageUrl,
    signatureText: body.signatureText
  })
  const html = typeof rendered === 'string' ? rendered : rendered.html

  // SMTP config from runtime config (defaults to mailpit in dev)
  const config = useRuntimeConfig()
  const transport = createTransport({
    host: config.smtpHost as string,
    port: Number(config.smtpPort),
    secure: false,
    ...(config.smtpUser
      ? { auth: { user: config.smtpUser as string, pass: config.smtpPass as string } }
      : {})
  })

  await transport.sendMail({
    from: `"${body.fromName}" <${body.fromEmail}>`,
    to: body.to,
    subject: body.subject,
    html
  })

  return { success: true }
})
