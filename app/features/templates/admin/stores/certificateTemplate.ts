import { defineStore } from 'pinia'
import { computed, reactive, toRefs } from 'vue'
import type { CertificateTemplate } from '~/features/templates/admin/types'
import { certificateTemplate as defaults } from '~/sample-api-responses/api-sample-response-templates'
import { useEditableState } from '~/features/_admin/composables/defineEditableStore'

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
    header: {
      showLogo: settings.showLogo,
      logoSize: settings.logoSize,
      title: settings.title,
      titleTextColor: settings.titleTextColor,
      subtitle: settings.subtitle
    },
    body: {
      bodyText: settings.bodyText
    },
    productSettings: {
      showProduct: settings.showProduct,
      productImageShape: settings.productImageShape
    },
    signatureSettings: {
      showSignature: settings.showSignature,
      signatureName: settings.signatureName,
      signatureTitle: settings.signatureTitle,
      signatureFontFamily: settings.signatureFontFamily
    },
    donorNameSettings: {
      showDonorName: settings.showDonorName,
      donorNameFontFamily: settings.donorNameFontFamily,
      donorNamePosition: settings.donorNamePosition
    },
    dateSettings: {
      showDate: settings.showDate
    },
    footerSettings: {
      footerText: settings.footerText
    },
    design: {
      layout: settings.layout,
      backgroundImage: settings.backgroundImage,
      pageBorderStyle: settings.pageBorderStyle,
      pageBorderThickness: settings.pageBorderThickness,
      separatorsAndBordersColor: settings.separatorsAndBordersColor
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
