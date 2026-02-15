import { computed } from 'vue'
import { toast } from 'vue-sonner'
import type { EmailTemplate, EmailTemplateCategory } from '~/features/templates/admin/types'
import { EMAIL_TEMPLATE_META } from '~/features/templates/admin/email-templates'
import { emailTemplates as mockTemplates } from '~/sample-api-responses/api-sample-response-templates'
import { useSessionStorageSingleton } from '~/features/_admin/composables/useSessionStorageSingleton'

/**
 * Email Templates Composable (Singleton Pattern)
 *
 * Manages 12 fixed system email templates. No create/delete — templates always exist.
 * Uses sessionStorage for persistence until API is available.
 */

const {
  items: templates,
  $persist,
  ensureHydrated
} = useSessionStorageSingleton<EmailTemplate>('templates-emails', mockTemplates)

export function useEmailTemplates() {
  ensureHydrated()

  const categoryCounts = computed(() => {
    const counts: Record<string, number> = { all: templates.value.length }
    for (const t of templates.value) {
      const cat = EMAIL_TEMPLATE_META[t.type]?.category
      if (cat) counts[cat] = (counts[cat] ?? 0) + 1
    }
    return counts
  })

  const stats = computed(() => [{ value: templates.value.length, label: 'templates' }])

  function getTemplateById(id: string): EmailTemplate | undefined {
    return templates.value.find((t) => t.id === id)
  }

  function getTemplatesByCategory(category: EmailTemplateCategory): EmailTemplate[] {
    return templates.value.filter((t) => EMAIL_TEMPLATE_META[t.type]?.category === category)
  }

  function updateTemplate(id: string, updates: Partial<EmailTemplate>): void {
    const now = new Date().toISOString()
    templates.value = templates.value.map((t) =>
      t.id === id ? { ...t, ...updates, updatedAt: now } : t
    )
    $persist()
  }

  function updateTemplateName(id: string, name: string): void {
    updateTemplate(id, { name })
    toast.success('Email template name updated')
  }

  return {
    templates: computed(() => templates.value),
    stats,
    categoryCounts,
    getTemplateById,
    getTemplatesByCategory,
    updateTemplate,
    updateTemplateName
  }
}
