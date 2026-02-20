import { defineStore } from 'pinia'
import { reactive, ref, toRefs, computed } from 'vue'
import type {
  EmailTemplate,
  EmailTemplateSettings,
  EmailTemplateType
} from '~/features/templates/admin/types'
import { EMAIL_TEMPLATE_META } from '~/features/templates/admin/email-templates'
import { useEditableState } from '~/features/_admin/composables/defineEditableStore'
import { useEmailTemplates } from '~/features/templates/admin/composables/useEmailTemplates'

const DEFAULTS: EmailTemplateSettings = {
  subject: '',
  bodyHtml: '',
  imageUrl: ''
}

export const useEmailTemplateStore = defineStore('emailTemplate', () => {
  const { isDirty, isSaving, markDirty, markClean } = useEditableState()
  const settings = reactive<EmailTemplateSettings>({ ...DEFAULTS })
  const templateId = ref<string | undefined>(undefined)
  const templateName = ref('')
  const templateType = ref<EmailTemplateType>('ecard-gift')

  const templateMeta = computed(() => EMAIL_TEMPLATE_META[templateType.value])

  function toSnapshot() {
    return {
      name: templateName.value,
      type: templateType.value,
      ...settings
    }
  }

  function initialize(template: EmailTemplate) {
    templateId.value = template.id
    templateName.value = template.name
    templateType.value = template.type

    settings.subject = template.subject
    settings.bodyHtml = template.bodyHtml
    settings.imageUrl = template.imageUrl
    markClean()
  }

  function save() {
    if (!templateId.value) return
    const { updateTemplate } = useEmailTemplates()
    updateTemplate(templateId.value, {
      ...settings,
      name: templateName.value
    })
  }

  return {
    ...toRefs(settings),
    id: templateId,
    name: templateName,
    type: templateType,
    templateMeta,
    isDirty,
    isSaving,
    initialize,
    markDirty,
    markClean,
    toSnapshot,
    save
  }
})
