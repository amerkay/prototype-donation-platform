import { ref } from 'vue'
import type { ReceiptPdfData } from '~/features/templates/admin/types'
import { useDonationFormStore } from '~/features/donation-form/donor/stores/donationForm'
import { useFormConfigStore } from '~/features/donation-form/shared/stores/formConfig'
import { useReceiptTemplateStore } from '~/features/templates/admin/stores/receiptTemplate'
import { useBrandingSettingsStore } from '~/features/settings/admin/stores/brandingSettings'
import { useCharitySettingsStore } from '~/features/settings/admin/stores/charitySettings'
import { useCampaigns } from '~/features/campaigns/shared/composables/useCampaigns'
import { formatCurrency } from '~/lib/formatCurrency'
import { toast } from 'vue-sonner'

function formatDate(): string {
  return new Intl.DateTimeFormat('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  }).format(new Date())
}

/**
 * Downloads a receipt PDF using actual donor data from the completed donation.
 * Uses the same /api/pdf pipeline as the admin receipt preview.
 */
export function useDownloadDonationReceipt() {
  const isGenerating = ref(false)

  async function downloadReceipt() {
    const store = useDonationFormStore()
    const formConfig = useFormConfigStore()
    const receipt = useReceiptTemplateStore()
    const branding = useBrandingSettingsStore()
    const charity = useCharitySettingsStore()
    const { getCampaignById } = useCampaigns()

    const currency = store.selectedCurrency
    const charityInfo = charity.getCharityForCurrency(currency)
    const donorInfo = store.formSections.donorInfo as Record<string, unknown>
    const donorName = donorInfo.name as Record<string, string> | undefined
    const shippingInfo = store.formSections.shipping as Record<string, string> | undefined

    const route = useRoute()
    const campaignId = (route.params.campaign_slug as string) || ''
    const campaign = getCampaignById(campaignId)

    // Build donor address string
    const addressParts = [
      shippingInfo?.line1,
      shippingInfo?.line2,
      [shippingInfo?.city, shippingInfo?.postcode].filter(Boolean).join(', ')
    ].filter(Boolean)

    const body: { type: string; data: ReceiptPdfData } = {
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
        showPhone: receipt.showPhone,
        showEmail: receipt.showEmail,
        showWebsite: receipt.showWebsite,
        branding: {
          logoUrl: branding.logoUrl,
          primaryColor: branding.primaryColor
        },
        charity: {
          name: charityInfo.name,
          registrationNumber: charityInfo.registrationNumber,
          address: charityInfo.address,
          phone: charityInfo.phone,
          email: charityInfo.email,
          website: charityInfo.website
        },
        donation: {
          receiptNumber: store.receiptId || `RCT-${Date.now()}`,
          date: formatDate(),
          donorName: `${donorName?.firstName || ''} ${donorName?.lastName || ''}`.trim(),
          ...(addressParts.length > 0 && { donorAddress: addressParts.join('\n') }),
          amount: formatCurrency(store.totalAmount, currency),
          currency,
          campaign: campaign?.name || formConfig.form?.title,
          paymentMethod: 'Visa \u2022\u2022\u2022\u2022 4242'
        }
      }
    }

    isGenerating.value = true
    try {
      const response = await $fetch<Blob>('/api/pdf', {
        method: 'POST',
        body,
        responseType: 'blob'
      })

      const blob = new Blob([response as unknown as BlobPart], { type: 'application/pdf' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `receipt-${store.receiptId || 'donation'}.pdf`
      link.click()
      URL.revokeObjectURL(url)
    } catch (e) {
      console.error('Receipt PDF generation failed:', e)
      toast.error('Failed to generate receipt. Please try again.')
    } finally {
      isGenerating.value = false
    }
  }

  return { downloadReceipt, isGenerating }
}
