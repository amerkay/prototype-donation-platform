import { computed, toValue, type MaybeRefOrGetter } from 'vue'
import { useBrandingSettingsStore } from '~/features/settings/admin/stores/brandingSettings'
import { useCharitySettingsStore } from '~/features/settings/admin/stores/charitySettings'
import { getBunnyFontUrls } from '~/features/settings/admin/utils/fonts'
import { processTemplateRichText } from '~/features/templates/admin/utils/template-rich-text'
import type { CertificateTemplateSettings } from '~/features/templates/admin/types'
import type {
  CertificateModel,
  CertificateTemplateTargets
} from '~/features/templates/shared/types'

export interface ProductPreviewData {
  name: string
  image: string
  text?: string
}

interface UseCertificatePreviewModelOptions {
  /** Resolved product to display (caller handles selection strategy) */
  product?: MaybeRefOrGetter<ProductPreviewData | undefined>
  /** Formatted sample amount (defaults to "£50.00") */
  amount?: MaybeRefOrGetter<string>
  /** Editable target paths for interactive preview */
  targets?: CertificateTemplateTargets
}

const SAMPLE_DATE = new Intl.DateTimeFormat('en-GB', {
  day: 'numeric',
  month: 'long',
  year: 'numeric'
}).format(new Date())

/**
 * Shared composable for building a CertificateModel from flat template settings.
 * Handles font loading and model construction — used by both CertificatePreview
 * and CertificatePreviewThumbnail to avoid duplication.
 */
export function useCertificatePreviewModel(
  template: MaybeRefOrGetter<CertificateTemplateSettings>,
  options?: UseCertificatePreviewModelOptions
) {
  const branding = useBrandingSettingsStore()
  const charity = useCharitySettingsStore()

  // Load custom fonts for signature + donor name + branding
  useHead({
    link: computed(() => {
      const t = toValue(template)
      return getBunnyFontUrls([
        branding.fontFamily,
        t.signatureFontFamily,
        t.donorNameFontFamily
      ]).map((href) => ({ rel: 'stylesheet', href }))
    })
  })

  const certificateModel = computed<CertificateModel>(() => {
    const t = toValue(template)
    const productData = toValue(options?.product)
    const amount = toValue(options?.amount) ?? '£50.00'
    const variableValues = { DONOR_NAME: 'John Smith', AMOUNT: amount, DATE: SAMPLE_DATE }
    const bodyHtml = processTemplateRichText(t.bodyText, variableValues)

    return {
      layout: t.layout,
      branding: {
        logoUrl: branding.logoUrl,
        charityName: charity.name,
        primaryColor: branding.primaryColor,
        secondaryColor: branding.secondaryColor,
        fontFamily: branding.fontFamily
      },
      design: {
        pageBorderStyle: t.pageBorderStyle,
        pageBorderThickness: t.pageBorderThickness,
        backgroundType: t.backgroundType,
        backgroundImage: t.backgroundImage,
        separatorsAndBordersColor: t.separatorsAndBordersColor
      },
      header: {
        showLogo: t.showLogo,
        logoSize: t.logoSize,
        logoPosition: t.logoPosition,
        titleLine1: t.titleLine1,
        titleLine2: t.titleLine2,
        titleTextColor: t.titleTextColor
      },
      awardBlock: t.showAwardSection
        ? {
            textLine1: t.awardTextLine1,
            donorName: { value: 'John Smith', show: true, fontFamily: t.donorNameFontFamily }
          }
        : undefined,
      bodyHtml,
      product:
        t.showProduct && productData
          ? {
              name: productData.name,
              image: productData.image,
              show: true,
              imageShape: t.productImageShape,
              text: productData.text
            }
          : undefined,
      date: t.showDate ? { value: SAMPLE_DATE, show: true } : undefined,
      signature: t.showSignature
        ? {
            show: true,
            name: t.signatureName,
            title: t.signatureTitle,
            fontFamily: t.signatureFontFamily
          }
        : undefined,
      footer: t.footerText ? { text: t.footerText } : undefined,
      targets: options?.targets
    }
  })

  return { certificateModel }
}
