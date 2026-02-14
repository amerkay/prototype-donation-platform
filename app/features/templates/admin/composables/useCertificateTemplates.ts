import { ref, computed } from 'vue'
import { toast } from 'vue-sonner'
import type { CertificateTemplate } from '~/features/templates/admin/types'
import { certificateTemplates as mockTemplates } from '~/sample-api-responses/api-sample-response-templates'

/**
 * Certificate Templates Composable (Singleton Pattern)
 *
 * Provides reactive access to certificate template data with CRUD operations.
 * Uses sessionStorage for persistence until API is available.
 */

const templates = ref<CertificateTemplate[]>([])
let hydrated = false

const DEFAULT_TEMPLATE: Omit<CertificateTemplate, 'id' | 'name' | 'createdAt' | 'updatedAt'> = {
  titleLine1: 'Certificate of',
  titleLine2: 'Achievement',
  logoPosition: 'center',
  awardTextLine1: 'This certificate is awarded to',
  bodyText: 'Thank you for your generous support.',
  pageBorderStyle: 'border',
  pageBorderThickness: 'medium',
  showLogo: true,
  logoSize: 'medium',
  showSignature: true,
  signatureName: '',
  signatureTitle: '',
  signatureFontFamily: 'Alex Brush',
  layout: 'portrait-classic',
  backgroundType: 'white',
  backgroundImage: null,
  showProduct: false,
  productImageShape: 'circle',
  titleTextColor: 'primary',
  separatorsAndBordersColor: 'secondary',
  showDate: true,
  showAwardSection: true,
  donorNameFontFamily: 'Pacifico',
  footerText: ''
}

function $hydrate(): void {
  if (hydrated) return
  if (!import.meta.client) return

  try {
    const saved = sessionStorage.getItem('templates-certificates')
    if (saved) {
      templates.value = JSON.parse(saved)
    } else {
      templates.value = [...mockTemplates]
    }
    hydrated = true
  } catch {
    templates.value = [...mockTemplates]
    hydrated = true
  }
}

function $persist(): void {
  if (!import.meta.client) return
  try {
    sessionStorage.setItem('templates-certificates', JSON.stringify(templates.value))
  } catch {
    /* ignore */
  }
}

export function useCertificateTemplates() {
  if (!hydrated) $hydrate()

  const templateOptions = computed(() =>
    templates.value.map((t) => ({ value: t.id, label: t.name }))
  )

  const stats = computed(() => [{ value: templates.value.length, label: 'templates' }])

  function getTemplateById(id: string): CertificateTemplate | undefined {
    return templates.value.find((t) => t.id === id)
  }

  function createTemplate(): string {
    const id = `cert-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
    const now = new Date().toISOString()

    const newTemplate: CertificateTemplate = {
      ...DEFAULT_TEMPLATE,
      id,
      name: 'Untitled Certificate',
      createdAt: now,
      updatedAt: now
    }

    templates.value.push(newTemplate)
    $persist()
    toast.success('Certificate template created')
    return id
  }

  function duplicateTemplate(id: string): string | undefined {
    const source = getTemplateById(id)
    if (!source) return undefined

    const newId = `cert-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
    const now = new Date().toISOString()

    const duplicate: CertificateTemplate = {
      ...source,
      id: newId,
      name: `${source.name} (Copy)`,
      createdAt: now,
      updatedAt: now
    }

    templates.value.push(duplicate)
    $persist()
    toast.success('Certificate template duplicated')
    return newId
  }

  function updateTemplate(id: string, updates: Partial<CertificateTemplate>): void {
    const now = new Date().toISOString()
    templates.value = templates.value.map((t) =>
      t.id === id ? { ...t, ...updates, updatedAt: now } : t
    )
    $persist()
  }

  function deleteTemplate(id: string): void {
    const index = templates.value.findIndex((t) => t.id === id)
    if (index === -1) return

    templates.value.splice(index, 1)
    $persist()
    toast.success('Certificate template deleted')
  }

  return {
    templates: computed(() => templates.value),
    templateOptions,
    stats,
    getTemplateById,
    createTemplate,
    duplicateTemplate,
    updateTemplate,
    deleteTemplate
  }
}
