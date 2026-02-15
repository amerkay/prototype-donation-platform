<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import AdminEditLayout from '~/features/_admin/components/AdminEditLayout.vue'
import EmailTemplateConfig from '~/features/templates/admin/components/EmailTemplateConfig.vue'
import EmailPreview from '~/features/templates/admin/components/EmailPreview.vue'
import EmailTemplateHeader from '~/features/templates/admin/components/EmailTemplateHeader.vue'
import { useEmailTemplateStore } from '~/features/templates/admin/stores/emailTemplate'
import { useEmailTemplates } from '~/features/templates/admin/composables/useEmailTemplates'
import { useAdminEdit } from '~/features/_admin/composables/useAdminEdit'

definePageMeta({ layout: 'admin' })

const route = useRoute()
const { getTemplateById, updateTemplateName } = useEmailTemplates()
const store = useEmailTemplateStore()

const template = computed(() => getTemplateById(route.params.id as string))

if (template.value) {
  store.initialize(template.value)
}

onMounted(() => {
  if (!template.value) {
    navigateTo('/admin/templates/emails')
  }
})

watch(
  () => route.params.id,
  (newId) => {
    const t = getTemplateById(newId as string)
    if (t) store.initialize(t)
  }
)

const originalData = computed(() => template.value)
const formConfigRef = ref()

const { handleSave, handleDiscard, confirmDiscard, showDiscardDialog } = useAdminEdit({
  store,
  formRef: formConfigRef,
  originalData,
  onSave: async () => {
    await new Promise((resolve) => setTimeout(resolve, 300))
    store.save()
  }
})

const breadcrumbs = computed(() => [
  { label: 'Dashboard', href: '/admin/dashboard' },
  { label: 'Templates', href: '#' },
  { label: 'Emails', href: '/admin/templates/emails' },
  { label: store.name || 'Untitled' }
])

function handleNameUpdate(newName: string) {
  if (!store.id) return
  store.name = newName
  updateTemplateName(store.id, newName)
}
</script>

<template>
  <div v-if="template">
    <AdminEditLayout
      :breadcrumbs="breadcrumbs"
      :is-dirty="store.isDirty"
      :show-discard-dialog="showDiscardDialog"
      :show-preview="false"
      editable-last-item
      :max-length="75"
      @update:show-discard-dialog="showDiscardDialog = $event"
      @confirm-discard="confirmDiscard"
      @update:last-item-label="handleNameUpdate"
    >
      <template #header>
        <EmailTemplateHeader @update:name="handleNameUpdate" />
      </template>

      <template #content>
        <div class="space-y-6">
          <EmailTemplateConfig ref="formConfigRef" @save="handleSave" @discard="handleDiscard" />
        </div>
      </template>

      <template #preview-label>Email Preview</template>

      <template #preview>
        <EmailPreview />
      </template>
    </AdminEditLayout>
  </div>
</template>
