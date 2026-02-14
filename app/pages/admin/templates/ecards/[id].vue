<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import AdminEditLayout from '~/features/_admin/components/AdminEditLayout.vue'
import EcardTemplateConfig from '~/features/templates/admin/components/EcardTemplateConfig.vue'
import EcardPreview from '~/features/templates/admin/components/EcardPreview.vue'
import EcardHeader from '~/features/templates/admin/components/EcardHeader.vue'
import { useEcardTemplateStore } from '~/features/templates/admin/stores/ecardTemplate'
import { useEcardTemplates } from '~/features/templates/admin/composables/useEcardTemplates'
import { useAdminEdit } from '~/features/_admin/composables/useAdminEdit'

definePageMeta({ layout: 'admin' })

const route = useRoute()
const { getTemplateById, updateTemplateName, updateTemplateStatus, deleteTemplate } =
  useEcardTemplates()
const store = useEcardTemplateStore()

const template = computed(() => getTemplateById(route.params.id as string))

// Initialize store synchronously
if (template.value) {
  store.initialize(template.value)
}

onMounted(() => {
  if (!template.value) {
    navigateTo('/admin/templates/ecards')
  }
})

// Watch for route param changes
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
  { label: 'eCards', href: '/admin/templates/ecards' },
  { label: store.name || 'Untitled' }
])

function handleNameUpdate(newName: string) {
  if (!store.id) return
  store.name = newName
  updateTemplateName(store.id, newName)
}

function handleStatusUpdate(newStatus: string) {
  if (!store.id) return
  store.status = newStatus as 'active' | 'archived'
  updateTemplateStatus(store.id, store.status)
}

function handleDeleted() {
  if (!store.id) return
  deleteTemplate(store.id)
  navigateTo('/admin/templates/ecards')
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
        <EcardHeader
          @update:name="handleNameUpdate"
          @update:status="handleStatusUpdate"
          @deleted="handleDeleted"
        />
      </template>

      <template #content>
        <div class="space-y-6">
          <EcardTemplateConfig ref="formConfigRef" @save="handleSave" @discard="handleDiscard" />
        </div>
      </template>

      <template #preview-label>Email Preview</template>

      <template #preview>
        <EcardPreview />
      </template>
    </AdminEditLayout>
  </div>
</template>
