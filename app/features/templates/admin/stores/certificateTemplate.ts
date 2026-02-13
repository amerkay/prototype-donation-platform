import { defineStore } from 'pinia'
import { computed, reactive, toRefs, watch } from 'vue'
import type { CertificateTemplate } from '~/features/templates/admin/types'
import { certificateTemplate as defaults } from '~/sample-api-responses/api-sample-response-templates'
import { useEditableState } from '~/features/_admin/composables/defineEditableStore'
import { useBrandingSettingsStore } from '~/features/settings/admin/stores/brandingSettings'

function normalizeTemplate(input: Partial<CertificateTemplate> = {}): CertificateTemplate {
  return {
    ...defaults,
    ...input
  }
}

export const useCertificateTemplateStore = defineStore('certificateTemplate', () => {
  const { isDirty, isSaving, markDirty, markClean } = useEditableState()
  const settings = reactive<CertificateTemplate>(normalizeTemplate())

  const certificate = computed(() => ({
    page: {
      layout: settings.layout,
      backgroundImage: settings.backgroundImage,
      pageBorderStyle: settings.pageBorderStyle,
      pageBorderThickness: settings.pageBorderThickness,
      separatorsAndBordersColor: settings.separatorsAndBordersColor
    },
    logo: {
      showLogo: settings.showLogo,
      logoSize: settings.logoSize,
      logoPosition: settings.logoPosition
    },
    title: {
      titleLine1: settings.titleLine1,
      titleLine2: settings.titleLine2,
      titleTextColor: settings.titleTextColor
    },
    award: {
      showAwardSection: settings.showAwardSection,
      awardTextLine1: settings.awardTextLine1,
      donorNameFontFamily: settings.donorNameFontFamily
    },
    body: {
      bodyText: settings.bodyText
    },
    product: {
      showProduct: settings.showProduct,
      productImageShape: settings.productImageShape
    },
    footer: {
      showDate: settings.showDate,
      footerText: settings.footerText,
      showSignature: settings.showSignature,
      signatureName: settings.signatureName,
      signatureTitle: settings.signatureTitle,
      signatureFontFamily: settings.signatureFontFamily
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
        Object.assign(
          settings,
          normalizeTemplate(JSON.parse(saved) as Partial<CertificateTemplate>)
        )
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

  // Force showLogo to false when no logo is available
  const branding = useBrandingSettingsStore()
  watch(
    () => branding.logoUrl,
    (logoUrl) => {
      if (!logoUrl && settings.showLogo) {
        settings.showLogo = false
      }
    },
    { immediate: true }
  )

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
