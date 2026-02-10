import type { CertificatePdfData, ReceiptPdfData } from '~~/app/features/templates/admin/types'
import { buildCertificateFragment } from '~~/app/features/templates/admin/builders/certificate-fragment'
import { buildReceiptFragment } from '~~/app/features/templates/admin/builders/receipt-fragment'
import { processTemplateRichText } from '~~/app/features/templates/admin/utils/template-rich-text'
import { wrapInPdfPage } from '../utils/pdf/wrap-pdf-page'
import { generatePdf } from '../utils/pdf/generate-pdf'

type PdfRequestBody =
  | { type: 'certificate'; data: CertificatePdfData }
  | { type: 'receipt'; data: ReceiptPdfData }

export default defineEventHandler(async (event) => {
  const body = await readBody<PdfRequestBody>(event)

  if (!body?.type || !body?.data) {
    throw createError({ statusCode: 400, statusMessage: 'Missing type or data' })
  }

  const {
    public: { siteUrl }
  } = useRuntimeConfig()
  const baseUrl = siteUrl as string

  let fragment: string
  let filename: string
  let orientation: 'portrait' | 'landscape' = 'portrait'
  let fontFamilies: string[] = []

  switch (body.type) {
    case 'certificate': {
      const { data } = body
      const variables = {
        DONOR_NAME: data.donorName,
        AMOUNT: data.amount,
        DATE: data.date
      }
      const subtitleHtml = processTemplateRichText(data.subtitle, variables)
      const bodyHtml = processTemplateRichText(data.bodyHtml, variables)
      const { subtitle, donorName, amount, date, ...fragmentData } = data
      fragment = buildCertificateFragment({
        ...fragmentData,
        subtitleHtml,
        bodyHtml
      })
      filename = 'certificate.pdf'
      orientation = data.orientation
      fontFamilies = [data.branding.fontFamily, data.signatureFontFamily]
      break
    }
    case 'receipt': {
      fragment = buildReceiptFragment(body.data)
      filename = 'receipt.pdf'
      break
    }
    default:
      throw createError({ statusCode: 400, statusMessage: 'Invalid template type' })
  }

  const html = wrapInPdfPage(fragment, { orientation, fontFamilies, baseUrl })

  const width = orientation === 'landscape' ? '297mm' : '210mm'
  const height = orientation === 'landscape' ? '210mm' : '297mm'

  const pdfBuffer = await generatePdf(html, {
    width,
    height,
    margin: { top: '0', right: '0', bottom: '0', left: '0' }
  })

  setResponseHeaders(event, {
    'Content-Type': 'application/pdf',
    'Content-Disposition': `attachment; filename="${filename}"`
  })

  return pdfBuffer
})
