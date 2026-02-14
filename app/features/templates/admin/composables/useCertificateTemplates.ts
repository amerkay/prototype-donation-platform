import { computed } from 'vue'
import { toast } from 'vue-sonner'
import type { CertificateTemplate } from '~/features/templates/admin/types'
import type { DeleteProtection } from '~/features/_admin/composables/useAdminEdit'
import { certificateTemplates as mockTemplates } from '~/sample-api-responses/api-sample-response-templates'
import { useSessionStorageSingleton } from '~/features/_admin/composables/useSessionStorageSingleton'
import { generateEntityId } from '~/lib/generateEntityId'
import { useProducts } from '~/features/products/admin/composables/useProducts'

/**
 * Certificate Templates Composable (Singleton Pattern)
 *
 * Provides reactive access to certificate template data with CRUD operations.
 * Uses sessionStorage for persistence until API is available.
 */

const DEFAULT_TEMPLATE: Omit<
  CertificateTemplate,
  'id' | 'name' | 'status' | 'createdAt' | 'updatedAt'
> = {
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

const {
  items: templates,
  $persist,
  ensureHydrated
} = useSessionStorageSingleton<CertificateTemplate>('templates-certificates', mockTemplates, {
  migrate: (t) => ({ ...t, status: t.status ?? 'active' })
})

export function useCertificateTemplates() {
  ensureHydrated()

  const templateOptions = computed(() =>
    templates.value.map((t) => ({ value: t.id, label: t.name }))
  )

  const activeCount = computed(() => templates.value.filter((t) => t.status === 'active').length)
  const stats = computed(() => [
    { value: templates.value.length, label: 'templates' },
    { value: activeCount.value, label: 'active' }
  ])

  function getTemplateById(id: string): CertificateTemplate | undefined {
    return templates.value.find((t) => t.id === id)
  }

  function createTemplate(): string {
    const id = generateEntityId('cert')
    const now = new Date().toISOString()

    const newTemplate: CertificateTemplate = {
      ...DEFAULT_TEMPLATE,
      id,
      name: 'Untitled Certificate',
      status: 'active',
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

    const newId = generateEntityId('cert')
    const now = new Date().toISOString()

    const duplicate: CertificateTemplate = {
      ...source,
      id: newId,
      name: `${source.name} (Copy)`,
      status: 'active',
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

  function getDeleteProtection(id: string): DeleteProtection {
    const template = getTemplateById(id)
    if (!template) return { canDelete: false, reason: 'Template not found' }
    // Lazy import to avoid circular dependency at module level
    const { products } = useProducts()
    const n = products.value.filter((p) => p.certificateTemplateId === id).length
    if (n > 0) {
      return {
        canDelete: false,
        reason: `Linked to ${n} product${n !== 1 ? 's' : ''} — unlink or archive instead`
      }
    }
    return { canDelete: true }
  }

  function updateTemplateName(id: string, name: string): void {
    updateTemplate(id, { name })
    toast.success('Certificate name updated')
  }

  function updateTemplateStatus(id: string, status: CertificateTemplate['status']): void {
    updateTemplate(id, { status })
    toast.success('Certificate status updated')
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
    updateTemplateName,
    updateTemplateStatus,
    deleteTemplate,
    getDeleteProtection
  }
}
