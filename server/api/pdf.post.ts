import type { CertificatePdfData, ReceiptPdfData } from '~~/app/features/templates/admin/types'
import type { CertificateModel, ReceiptModel } from '~~/app/features/templates/shared/types'
import { processTemplateRichText } from '~~/app/features/templates/admin/utils/template-rich-text'
import { generatePdf } from '../utils/pdf/generate-pdf'
import { storePrintData } from '../utils/pdf/print-data-store'

type PdfRequestBody =
  | { type: 'certificate'; data: CertificatePdfData }
  | { type: 'receipt'; data: ReceiptPdfData }

/**
 * Build a CertificateModel from CertificatePdfData for the print page.
 */
function buildCertificateModel(data: CertificatePdfData): CertificateModel {
  const variables = {
    DONOR_NAME: data.donorName,
    AMOUNT: data.amount,
    DATE: data.date
  }

  const awardTextLine2Html = processTemplateRichText(data.awardTextLine2, variables)
  const bodyHtml = processTemplateRichText(data.bodyHtml, variables)

  return {
    layout: data.layout,
    branding: data.branding,
    design: {
      pageBorderStyle: data.pageBorderStyle,
      pageBorderThickness: data.pageBorderThickness,
      backgroundImage: data.backgroundImage,
      separatorsAndBordersColor: data.separatorsAndBordersColor
    },
    header: {
      showLogo: data.showLogo,
      logoSize: data.logoSize,
      logoPosition: data.logoPosition,
      titleLine1: data.titleLine1,
      titleLine2: data.titleLine2,
      titleTextColor: data.titleTextColor
    },
    awardBlock: {
      textLine1: data.awardTextLine1,
      donorName: data.showDonorName
        ? {
            value: data.donorName,
            show: true,
            fontFamily: data.donorNameFontFamily
          }
        : undefined,
      textLine2Html: awardTextLine2Html
    },
    bodyHtml,
    product:
      data.showProduct && data.product
        ? {
            name: data.product.name,
            image: data.product.image,
            show: true,
            imageShape: data.productImageShape
          }
        : undefined,
    date: data.showDate ? { value: data.date, show: true } : undefined,
    signature: data.showSignature
      ? {
          show: true,
          name: data.signatureName,
          title: data.signatureTitle,
          fontFamily: data.signatureFontFamily
        }
      : undefined,
    footer: data.footerText ? { text: data.footerText } : undefined
  }
}

/**
 * Build a ReceiptModel from ReceiptPdfData for the print page.
 */
function buildReceiptModel(data: ReceiptPdfData): ReceiptModel {
  return {
    headerText: data.headerText,
    footerText: data.footerText,
    showGiftAid: data.showGiftAid,
    showPaymentMethod: data.showPaymentMethod,
    showCampaignName: data.showCampaignName,
    showLogo: data.showLogo,
    branding: data.branding,
    charity: data.charity,
    donation: data.donation
  }
}

export default defineEventHandler(async (event) => {
  const body = await readBody<PdfRequestBody>(event)

  if (!body?.type || !body?.data) {
    throw createError({ statusCode: 400, statusMessage: 'Missing type or data' })
  }

  const {
    public: { siteUrl }
  } = useRuntimeConfig()
  const baseUrl = siteUrl as string

  let pdfBuffer: Buffer
  let filename: string

  switch (body.type) {
    case 'certificate': {
      const { data } = body
      const orientation = data.layout === 'landscape-classic' ? 'landscape' : 'portrait'
      const width = orientation === 'landscape' ? '297mm' : '210mm'
      const height = orientation === 'landscape' ? '210mm' : '297mm'

      // Build the certificate model and store it
      const model = buildCertificateModel(data)
      const token = storePrintData(model)

      // Generate PDF by navigating to the print page
      const printUrl = `${baseUrl}/print/certificate?token=${token}`

      pdfBuffer = await generatePdf({
        url: printUrl,
        width,
        height,
        margin: { top: '0', right: '0', bottom: '0', left: '0' }
      })

      filename = 'certificate.pdf'
      break
    }
    case 'receipt': {
      // Build the receipt model and store it
      const model = buildReceiptModel(body.data)
      const token = storePrintData(model)

      // Generate PDF by navigating to the print page
      const printUrl = `${baseUrl}/print/receipt?token=${token}`

      pdfBuffer = await generatePdf({
        url: printUrl,
        width: '210mm',
        height: '297mm',
        margin: { top: '0', right: '0', bottom: '0', left: '0' }
      })

      filename = 'receipt.pdf'
      break
    }
    default:
      throw createError({ statusCode: 400, statusMessage: 'Invalid template type' })
  }

  setResponseHeaders(event, {
    'Content-Type': 'application/pdf',
    'Content-Disposition': `attachment; filename="${filename}"`
  })

  return pdfBuffer
})
