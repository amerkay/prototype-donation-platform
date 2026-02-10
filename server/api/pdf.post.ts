import type { CertificatePdfData, ReceiptPdfData } from '~~/app/features/templates/admin/types'
import { buildCertificateFragment } from '~~/app/features/templates/admin/builders/certificate-fragment'
import { buildReceiptFragment } from '~~/app/features/templates/admin/builders/receipt-fragment'
import { replaceVariables, escapeHtml } from '~~/app/features/templates/admin/builders/utils'
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
      const processedBody = replaceVariables(data.bodyHtml, {
        DONOR_NAME: escapeHtml(data.donorName),
        AMOUNT: escapeHtml(data.amount),
        DATE: escapeHtml(data.date)
      })
      const processedSubtitle = replaceVariables(data.subtitle, {
        DONOR_NAME: escapeHtml(data.donorName),
        AMOUNT: escapeHtml(data.amount),
        DATE: escapeHtml(data.date)
      })
      fragment = buildCertificateFragment({
        title: data.title,
        subtitleHtml: processedSubtitle,
        bodyHtml: processedBody,
        bodyTextFontSize: data.bodyTextFontSize,
        borderStyle: data.borderStyle,
        borderThickness: data.borderThickness,
        orientation: data.orientation,
        showLogo: data.showLogo,
        showSignature: data.showSignature,
        signatureName: data.signatureName,
        signatureTitle: data.signatureTitle,
        signatureFontFamily: data.signatureFontFamily,
        backgroundImage: data.backgroundImage,
        showProduct: data.showProduct,
        productBorderRadius: data.productBorderRadius,
        titleColor: data.titleColor,
        separatorsAndBorders: data.separatorsAndBorders,
        branding: data.branding,
        product: data.product
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
