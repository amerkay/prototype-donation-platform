import { defineStore } from 'pinia'
import { reactive, ref, toRefs } from 'vue'
import type { ECardTemplate, ECardTemplateSettings } from '~/features/templates/admin/types'
import { useEditableState } from '~/features/_admin/composables/defineEditableStore'
import { useEcardTemplates } from '~/features/templates/admin/composables/useEcardTemplates'

const DEFAULTS: ECardTemplateSettings = {
  subject: '',
  imageUrl: '',
  bodyHtml: '',
  category: 'thank-you'
}

export const useEcardTemplateStore = defineStore('ecardTemplate', () => {
  const { isDirty, isSaving, markDirty, markClean } = useEditableState()
  const settings = reactive<ECardTemplateSettings>({ ...DEFAULTS })
  const templateId = ref<string | undefined>(undefined)
  const templateName = ref('')
  const templateStatus = ref<'active' | 'archived'>('active')

  function initialize(template: ECardTemplate) {
    templateId.value = template.id
    templateName.value = template.name
    templateStatus.value = template.status ?? 'active'

    settings.subject = template.subject
    settings.imageUrl = template.imageUrl
    settings.bodyHtml = template.bodyHtml
    settings.category = template.category
    markClean()
  }

  function save() {
    if (!templateId.value) return
    const { updateTemplate } = useEcardTemplates()
    updateTemplate(templateId.value, {
      ...settings,
      name: templateName.value,
      status: templateStatus.value
    })
  }

  return {
    ...toRefs(settings),
    id: templateId,
    name: templateName,
    status: templateStatus,
    isDirty,
    isSaving,
    initialize,
    markDirty,
    markClean,
    save
  }
})
