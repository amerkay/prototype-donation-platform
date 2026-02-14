import { computed } from 'vue'
import { toast } from 'vue-sonner'
import type { ECardTemplate } from '~/features/templates/admin/types'
import type { DeleteProtection } from '~/features/_admin/composables/useAdminEdit'
import { ecardTemplates as mockTemplates } from '~/sample-api-responses/api-sample-response-templates'
import { useSessionStorageSingleton } from '~/features/_admin/composables/useSessionStorageSingleton'
import { generateEntityId } from '~/lib/generateEntityId'

/**
 * eCard Templates Composable (Singleton Pattern)
 *
 * Provides reactive access to eCard template data with CRUD operations.
 * Uses sessionStorage for persistence until API is available.
 */

const {
  items: templates,
  $persist,
  ensureHydrated
} = useSessionStorageSingleton<ECardTemplate>('templates-ecards', mockTemplates, {
  migrate: (t) => ({
    ...t,
    status: t.status ?? 'active',
    updatedAt: t.updatedAt ?? t.createdAt
  })
})

export function useEcardTemplates() {
  ensureHydrated()

  const activeCount = computed(() => templates.value.filter((t) => t.status === 'active').length)
  const stats = computed(() => [
    { value: templates.value.length, label: 'templates' },
    { value: activeCount.value, label: 'active' }
  ])

  function getTemplateById(id: string): ECardTemplate | undefined {
    return templates.value.find((t) => t.id === id)
  }

  function createTemplate(): string {
    const id = generateEntityId('ecard')
    const now = new Date().toISOString()

    const newTemplate: ECardTemplate = {
      id,
      name: 'Untitled eCard',
      status: 'active',
      subject: '',
      imageUrl: '',
      bodyHtml: '',
      category: 'thank-you',
      createdAt: now,
      updatedAt: now
    }

    templates.value.push(newTemplate)
    $persist()
    toast.success('eCard template created')
    return id
  }

  function duplicateTemplate(id: string): string | undefined {
    const source = getTemplateById(id)
    if (!source) return undefined

    const newId = generateEntityId('ecard')
    const now = new Date().toISOString()

    const duplicate: ECardTemplate = {
      ...source,
      id: newId,
      name: `${source.name} (Copy)`,
      status: 'active',
      createdAt: now,
      updatedAt: now
    }

    templates.value.push(duplicate)
    $persist()
    toast.success('eCard template duplicated')
    return newId
  }

  function updateTemplate(id: string, updates: Partial<ECardTemplate>): void {
    const now = new Date().toISOString()
    templates.value = templates.value.map((t) =>
      t.id === id ? { ...t, ...updates, updatedAt: now } : t
    )
    $persist()
  }

  function getDeleteProtection(id: string): DeleteProtection {
    if (!getTemplateById(id)) return { canDelete: false, reason: 'Template not found' }
    return { canDelete: true }
  }

  function updateTemplateName(id: string, name: string): void {
    updateTemplate(id, { name })
    toast.success('eCard name updated')
  }

  function updateTemplateStatus(id: string, status: ECardTemplate['status']): void {
    updateTemplate(id, { status })
    toast.success('eCard status updated')
  }

  function deleteTemplate(id: string): void {
    const index = templates.value.findIndex((t) => t.id === id)
    if (index === -1) return

    templates.value.splice(index, 1)
    $persist()
    toast.success('eCard template deleted')
  }

  return {
    templates: computed(() => templates.value),
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
