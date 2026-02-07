import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { ECardTemplate } from '~/features/templates/admin/types'
import { ecardTemplates as defaults } from '~/sample-api-responses/api-sample-response-templates'
import { toast } from 'vue-sonner'

export const useECardTemplatesStore = defineStore('ecardTemplates', () => {
  const templates = ref<ECardTemplate[]>([...defaults])

  let hydrated = false
  function $hydrate() {
    if (hydrated) return
    try {
      const saved = sessionStorage.getItem('templates-ecards')
      if (saved) templates.value = JSON.parse(saved)
    } catch {
      /* ignore */
    }
    hydrated = true
  }

  function $persist() {
    if (!import.meta.client) return
    try {
      sessionStorage.setItem('templates-ecards', JSON.stringify(templates.value))
    } catch {
      /* ignore */
    }
  }

  function createTemplate(data: Omit<ECardTemplate, 'id' | 'createdAt'>) {
    templates.value.push({
      ...data,
      id: `ecard-${Date.now()}`,
      createdAt: new Date().toISOString()
    })
    $persist()
    toast.success('eCard template created')
  }

  function updateTemplate(id: string, data: Partial<Omit<ECardTemplate, 'id' | 'createdAt'>>) {
    const template = templates.value.find((t) => t.id === id)
    if (template) {
      Object.assign(template, data)
      $persist()
    }
  }

  function deleteTemplate(id: string) {
    templates.value = templates.value.filter((t) => t.id !== id)
    $persist()
    toast.success('eCard template deleted')
  }

  if (import.meta.client) $hydrate()

  return {
    templates,
    createTemplate,
    updateTemplate,
    deleteTemplate
  }
})
