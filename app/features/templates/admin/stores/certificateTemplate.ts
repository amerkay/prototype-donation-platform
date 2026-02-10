import { defineStore } from 'pinia'
import { computed, reactive, toRefs } from 'vue'
import type { CertificateTemplate } from '~/features/templates/admin/types'
import { certificateTemplate as defaults } from '~/sample-api-responses/api-sample-response-templates'
import { useEditableState } from '~/features/_admin/composables/defineEditableStore'

type LegacyCertificateTemplate = Partial<CertificateTemplate> & {
  separatorColor?: string
  productBorderColor?: string
  certificate?: {
    header?: {
      showLogo?: boolean
      title?: string
      titleColor?: string
      subtitle?: string
    }
    body?: {
      bodyText?: string
      bodyTextFontSize?: 'small' | 'medium' | 'large'
      separatorColor?: string
    }
    productSettings?: {
      showProduct?: boolean
      productBorderRadius?: 'circle' | 'rounded' | 'square'
      productBorderColor?: string
    }
    signatureSettings?: {
      showSignature?: boolean
      signatureName?: string
      signatureTitle?: string
      signatureFontFamily?: string
    }
    design?: {
      orientation?: 'portrait' | 'landscape'
      backgroundImage?: string | null
      borderStyle?: 'classic' | 'modern' | 'minimal' | 'ornate'
      separatorsAndBorders?: string
    }
  }
}

function normalizeTemplate(input: Partial<LegacyCertificateTemplate> = {}): CertificateTemplate {
  const nested = input.certificate

  const separatorsAndBorders =
    nested?.design?.separatorsAndBorders ??
    input.separatorsAndBorders ??
    nested?.body?.separatorColor ??
    nested?.productSettings?.productBorderColor ??
    input.separatorColor ??
    input.productBorderColor ??
    defaults.separatorsAndBorders

  return {
    ...defaults,
    title: nested?.header?.title ?? input.title ?? defaults.title,
    subtitle: nested?.header?.subtitle ?? input.subtitle ?? defaults.subtitle,
    bodyText: nested?.body?.bodyText ?? input.bodyText ?? defaults.bodyText,
    bodyTextFontSize:
      nested?.body?.bodyTextFontSize ?? input.bodyTextFontSize ?? defaults.bodyTextFontSize,
    borderStyle: nested?.design?.borderStyle ?? input.borderStyle ?? defaults.borderStyle,
    showLogo: nested?.header?.showLogo ?? input.showLogo ?? defaults.showLogo,
    showSignature:
      nested?.signatureSettings?.showSignature ?? input.showSignature ?? defaults.showSignature,
    signatureName:
      nested?.signatureSettings?.signatureName ?? input.signatureName ?? defaults.signatureName,
    signatureTitle:
      nested?.signatureSettings?.signatureTitle ?? input.signatureTitle ?? defaults.signatureTitle,
    signatureFontFamily:
      nested?.signatureSettings?.signatureFontFamily ??
      input.signatureFontFamily ??
      defaults.signatureFontFamily,
    orientation: nested?.design?.orientation ?? input.orientation ?? defaults.orientation,
    backgroundImage:
      nested?.design?.backgroundImage ?? input.backgroundImage ?? defaults.backgroundImage,
    showProduct: nested?.productSettings?.showProduct ?? input.showProduct ?? defaults.showProduct,
    productBorderRadius:
      nested?.productSettings?.productBorderRadius ??
      input.productBorderRadius ??
      defaults.productBorderRadius,
    titleColor: nested?.header?.titleColor ?? input.titleColor ?? defaults.titleColor,
    separatorsAndBorders
  }
}

export const useCertificateTemplateStore = defineStore('certificateTemplate', () => {
  const { isDirty, isSaving, markDirty, markClean } = useEditableState()
  const settings = reactive<CertificateTemplate>(normalizeTemplate())

  const certificate = computed(() => ({
    header: {
      showLogo: settings.showLogo,
      title: settings.title,
      titleColor: settings.titleColor,
      subtitle: settings.subtitle
    },
    body: {
      bodyText: settings.bodyText,
      bodyTextFontSize: settings.bodyTextFontSize
    },
    productSettings: {
      showProduct: settings.showProduct,
      productBorderRadius: settings.productBorderRadius
    },
    signatureSettings: {
      showSignature: settings.showSignature,
      signatureName: settings.signatureName,
      signatureTitle: settings.signatureTitle,
      signatureFontFamily: settings.signatureFontFamily
    },
    design: {
      orientation: settings.orientation,
      backgroundImage: settings.backgroundImage,
      borderStyle: settings.borderStyle,
      separatorsAndBorders: settings.separatorsAndBorders
    }
  }))

  function initialize(template: CertificateTemplate) {
    Object.assign(settings, normalizeTemplate(template))
    markClean()
  }

  function updateSettings(template: Partial<CertificateTemplate>) {
    Object.assign(settings, normalizeTemplate({ ...settings, ...template }))
    markDirty()
  }

  let hydrated = false
  function $hydrate() {
    if (hydrated) return
    try {
      const saved = sessionStorage.getItem('template-certificate')
      if (saved) {
        Object.assign(settings, normalizeTemplate(JSON.parse(saved) as LegacyCertificateTemplate))
        markClean()
      }
    } catch {
      /* ignore */
    }
    hydrated = true
  }

  function save() {
    try {
      sessionStorage.setItem('template-certificate', JSON.stringify(settings))
    } catch {
      /* ignore */
    }
  }

  if (import.meta.client) $hydrate()

  return {
    ...toRefs(settings),
    certificate,
    isDirty,
    isSaving,
    initialize,
    updateSettings,
    markDirty,
    markClean,
    $hydrate,
    save
  }
})
