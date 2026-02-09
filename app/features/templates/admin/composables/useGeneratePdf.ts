import { ref } from 'vue'
import type { CertificatePdfData, ReceiptPdfData } from '~/features/templates/admin/types'
import { useCertificateTemplateStore } from '~/features/templates/admin/stores/certificateTemplate'
import { useReceiptTemplateStore } from '~/features/templates/admin/stores/receiptTemplate'
import { useBrandingSettingsStore } from '~/features/settings/admin/stores/brandingSettings'
import { useCharitySettingsStore } from '~/features/settings/admin/stores/charitySettings'
import { useCurrencySettingsStore } from '~/features/settings/admin/stores/currencySettings'
import { formatCurrency } from '~/lib/formatCurrency'
import { products as sampleProducts } from '~/sample-api-responses/api-sample-response-products'

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

  async function downloadPdf(type: 'certificate' | 'receipt', currency?: string) {
    isGenerating.value = true
    error.value = null

    try {
      const branding = useBrandingSettingsStore()
      const currencyStore = useCurrencySettingsStore()
      const activeCurrency = currency || currencyStore.defaultCurrency

      let body: { type: string; data: CertificatePdfData | ReceiptPdfData }

      if (type === 'certificate') {
        const cert = useCertificateTemplateStore()
        const sampleP = sampleProducts.find((p) => p.image && p.certificateOverrideName)
        const product = sampleP?.image
          ? { name: sampleP.certificateOverrideName || sampleP.name, image: sampleP.image }
          : undefined
        body = {
          type: 'certificate',
          data: {
            title: cert.title,
            subtitle: cert.subtitle,
            bodyHtml: cert.bodyText,
            borderStyle: cert.borderStyle,
            showLogo: cert.showLogo,
            showDate: cert.showDate,
            showSignature: cert.showSignature,
            signatureName: cert.signatureName,
            signatureTitle: cert.signatureTitle,
            orientation: cert.orientation,
            backgroundImage: cert.backgroundImage,
            showProduct: cert.showProduct,
            productBorderRadius: cert.productBorderRadius,
            productBorderColor: cert.productBorderColor,
            productNameColor: cert.productNameColor,
            titleColor: cert.titleColor,
            signatureColor: cert.signatureColor,
            branding: {
              logoUrl: branding.logoUrl,
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
              amount: formatCurrency(50, activeCurrency),
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
