import { ref } from 'vue'
import type { CertificatePdfData, ReceiptPdfData } from '~/features/templates/admin/types'
import type { Product } from '~/features/donation-form/features/product/shared/types'
import { useCertificateTemplateStore } from '~/features/templates/admin/stores/certificateTemplate'
import { useReceiptTemplateStore } from '~/features/templates/admin/stores/receiptTemplate'
import { useBrandingSettingsStore } from '~/features/settings/admin/stores/brandingSettings'
import { useCharitySettingsStore } from '~/features/settings/admin/stores/charitySettings'
import { useCurrencySettingsStore } from '~/features/settings/admin/stores/currencySettings'
import { formatCurrency } from '~/lib/formatCurrency'
import { useProducts } from '~/features/products/admin/composables/useProducts'

interface CertificatePdfOptions {
  currency?: string
  product?: Product
}

function formatDate(): string {
  return new Intl.DateTimeFormat('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  }).format(new Date())
}

export function useGeneratePdf() {
  const isGenerating = ref(false)
  const error = ref<string | null>(null)

  async function downloadPdf(type: 'certificate', options?: CertificatePdfOptions): Promise<void>
  async function downloadPdf(type: 'receipt', options?: { currency?: string }): Promise<void>
  async function downloadPdf(
    type: 'certificate' | 'receipt',
    options?: CertificatePdfOptions | { currency?: string }
  ) {
    isGenerating.value = true
    error.value = null

    try {
      const branding = useBrandingSettingsStore()
      const currencyStore = useCurrencySettingsStore()
      const activeCurrency = options?.currency || currencyStore.defaultCurrency

      let body: { type: string; data: CertificatePdfData | ReceiptPdfData }

      if (type === 'certificate') {
        const cert = useCertificateTemplateStore()
        const charity = useCharitySettingsStore()
        const certificate = cert.certificate
        const certOptions = options as CertificatePdfOptions | undefined
        const { products: allProducts } = useProducts()
        // Use explicitly selected product, or resolve from linked/available products (same as preview)
        const linkedProducts = allProducts.value.filter((p) => {
          if (cert.pendingProductUnlinks.has(p.id)) return false
          if (cert.pendingProductLinks.has(p.id)) return true
          return p.certificateTemplateId === cert.id
        })
        const sampleP = certOptions?.product || linkedProducts[0] || allProducts.value[0]
        const product = sampleP
          ? {
              name: sampleP.certificateOverrideName || sampleP.name,
              image: sampleP.image || '',
              text: sampleP.certificateText
            }
          : undefined
        body = {
          type: 'certificate',
          data: {
            titleLine1: certificate.title.titleLine1,
            titleLine2: certificate.title.titleLine2,
            logoPosition: certificate.logo.logoPosition,
            awardTextLine1: certificate.award.awardTextLine1,
            bodyHtml: certificate.body.bodyText,
            pageBorderStyle: certificate.page.pageBorderStyle,
            pageBorderThickness: certificate.page.pageBorderThickness,
            showLogo: certificate.logo.showLogo,
            logoSize: certificate.logo.logoSize,
            showSignature: certificate.footer.showSignature,
            signatureName: certificate.footer.signatureName,
            signatureTitle: certificate.footer.signatureTitle,
            signatureFontFamily: certificate.footer.signatureFontFamily,
            layout: certificate.page.layout,
            backgroundType: certificate.page.backgroundType,
            backgroundImage: certificate.page.backgroundImage,
            showProduct: certificate.product.showProduct,
            productImageShape: certificate.product.productImageShape,
            titleTextColor: certificate.title.titleTextColor,
            separatorsAndBordersColor: certificate.page.separatorsAndBordersColor,
            showDate: certificate.footer.showDate,
            showAwardSection: certificate.award.showAwardSection,
            donorNameFontFamily: certificate.award.donorNameFontFamily,
            footerText: certificate.footer.footerText,
            branding: {
              logoUrl: branding.logoUrl,
              charityName: charity.name,
              primaryColor: branding.primaryColor,
              secondaryColor: branding.secondaryColor,
              fontFamily: branding.fontFamily
            },
            donorName: 'John Smith',
            amount: formatCurrency(50, activeCurrency),
            date: formatDate(),
            product
          }
        }
      } else {
        const receipt = useReceiptTemplateStore()
        const charity = useCharitySettingsStore()
        const charityInfo = charity.getCharityForCurrency(activeCurrency)
        body = {
          type: 'receipt',
          data: {
            headerText: receipt.headerText,
            footerText: receipt.footerText,
            showGiftAid: receipt.showGiftAid,
            showPaymentMethod: receipt.showPaymentMethod,
            showCampaignName: receipt.showCampaignName,
            showLogo: receipt.showLogo,
            taxDeductibleStatement: receipt.taxDeductibleStatement,
            showDonorAddress: receipt.showDonorAddress,
            branding: {
              logoUrl: branding.logoUrl,
              primaryColor: branding.primaryColor
            },
            charity: {
              name: charityInfo.name,
              registrationNumber: charityInfo.registrationNumber,
              address: charityInfo.address
            },
            donation: {
              receiptNumber: 'RCP-2025-001234',
              date: formatDate(),
              donorName: 'John Smith',
              donorAddress: '123 Example Street\nLondon, SW1A 1AA',
              amount: formatCurrency(50, activeCurrency),
              currency: activeCurrency,
              campaign: 'Emergency Relief Fund',
              paymentMethod: 'Visa \u2022\u2022\u2022\u2022 4242'
            }
          }
        }
      }

      const response = await $fetch<Blob>('/api/pdf', {
        method: 'POST',
        body,
        responseType: 'blob'
      })

      // Trigger browser download
      const blob = new Blob([response as unknown as BlobPart], { type: 'application/pdf' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `${type}.pdf`
      link.click()
      URL.revokeObjectURL(url)
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Failed to generate PDF'
      console.error('PDF generation failed:', e)
    } finally {
      isGenerating.value = false
    }
  }

  return { isGenerating, error, downloadPdf }
}
