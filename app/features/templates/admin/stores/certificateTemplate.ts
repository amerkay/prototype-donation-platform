import { defineStore } from 'pinia'
import { computed, reactive, ref, toRefs, watch } from 'vue'
import type {
  CertificateTemplate,
  CertificateTemplateSettings
} from '~/features/templates/admin/types'
import { certificateTemplate as fullDefaults } from '~/sample-api-responses/api-sample-response-templates'
import { useEditableState } from '~/features/_admin/composables/defineEditableStore'
import { useBrandingSettingsStore } from '~/features/settings/admin/stores/brandingSettings'
import { useCertificateTemplates } from '~/features/templates/admin/composables/useCertificateTemplates'
import { useProducts } from '~/features/products/admin/composables/useProducts'

// Strip identity fields from defaults — they must never leak into settings
const {
  id: _,
  name: __,
  status: ___,
  createdAt: ____,
  updatedAt: _____,
  ...DEFAULTS
} = fullDefaults as unknown as Record<string, unknown>

function normalizeTemplate(
  input: Partial<CertificateTemplateSettings> = {}
): CertificateTemplateSettings {
  const {
    id: _id,
    name: _name,
    status: _status,
    createdAt: _ca,
    updatedAt: _ua,
    ...rest
  } = input as Record<string, unknown>
  const merged = { ...DEFAULTS, ...rest } as CertificateTemplateSettings
  // Derive backgroundType for backward compatibility
  if (merged.backgroundType === undefined) {
    merged.backgroundType = merged.backgroundImage ? 'image' : 'white'
  }
  return merged
}

export const useCertificateTemplateStore = defineStore('certificateTemplate', () => {
  const { isDirty, isSaving, markDirty, markClean } = useEditableState()
  const settings = reactive<CertificateTemplateSettings>(normalizeTemplate())
  const templateId = ref<string | undefined>(undefined)
  const templateName = ref('')
  const templateStatus = ref<'active' | 'archived'>('active')

  // Pending product assignment changes (like campaign pendingFormDeletes pattern)
  const pendingProductLinks = ref<Set<string>>(new Set())
  const pendingProductUnlinks = ref<Set<string>>(new Set())

  const certificate = computed(() => ({
    page: {
      layout: settings.layout,
      backgroundType: settings.backgroundType,
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

  /** Flat settings snapshot for composables (e.g., useCertificatePreviewModel) */
  const flatSettings = computed<CertificateTemplateSettings>(() => ({ ...settings }))

  function toSnapshot() {
    return {
      name: templateName.value,
      status: templateStatus.value,
      ...settings,
      pendingProductLinks: [...pendingProductLinks.value],
      pendingProductUnlinks: [...pendingProductUnlinks.value]
    }
  }

  function initialize(template: CertificateTemplate) {
    templateId.value = template.id
    templateName.value = template.name
    templateStatus.value = template.status ?? 'active'
    pendingProductLinks.value = new Set()
    pendingProductUnlinks.value = new Set()
    Object.assign(settings, normalizeTemplate(template))
    markClean()
  }

  function updateSettings(template: Partial<CertificateTemplateSettings>) {
    Object.assign(settings, normalizeTemplate({ ...settings, ...template }))
    markDirty()
  }

  /** Stage a product to be linked on save */
  function addPendingProductLink(productId: string) {
    // If it was pending unlink, just cancel that
    if (pendingProductUnlinks.value.has(productId)) {
      pendingProductUnlinks.value = new Set(
        [...pendingProductUnlinks.value].filter((id) => id !== productId)
      )
    } else {
      pendingProductLinks.value = new Set([...pendingProductLinks.value, productId])
    }
    markDirty()
  }

  /** Stage a product to be unlinked on save */
  function addPendingProductUnlink(productId: string) {
    // If it was pending link, just cancel that
    if (pendingProductLinks.value.has(productId)) {
      pendingProductLinks.value = new Set(
        [...pendingProductLinks.value].filter((id) => id !== productId)
      )
    } else {
      pendingProductUnlinks.value = new Set([...pendingProductUnlinks.value, productId])
    }
    markDirty()
  }

  /** Commit pending product changes to the products store */
  function commitProductChanges() {
    const { updateProduct } = useProducts()
    for (const productId of pendingProductLinks.value) {
      updateProduct(productId, { certificateTemplateId: templateId.value })
    }
    for (const productId of pendingProductUnlinks.value) {
      updateProduct(productId, { certificateTemplateId: undefined })
    }
    pendingProductLinks.value = new Set()
    pendingProductUnlinks.value = new Set()
  }

  // TODO-SUPABASE: Persistence delegated to useCertificateTemplates().updateTemplate() — no direct DB calls here
  function save() {
    if (!templateId.value) return
    const { updateTemplate } = useCertificateTemplates()
    updateTemplate(templateId.value, {
      ...settings,
      name: templateName.value,
      status: templateStatus.value
    })
    commitProductChanges()
  }

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
    id: templateId,
    name: templateName,
    status: templateStatus,
    certificate,
    flatSettings,
    pendingProductLinks,
    pendingProductUnlinks,
    isDirty,
    isSaving,
    initialize,
    updateSettings,
    markDirty,
    markClean,
    toSnapshot,
    addPendingProductLink,
    addPendingProductUnlink,
    save
  }
})
