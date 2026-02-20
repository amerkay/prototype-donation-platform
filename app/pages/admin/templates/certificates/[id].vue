<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import AdminEditLayout from '~/features/_admin/components/AdminEditLayout.vue'
import CertificateTemplateConfig from '~/features/templates/admin/components/CertificateTemplateConfig.vue'
import CertificatePreview from '~/features/templates/admin/components/CertificatePreview.vue'
import CertificateHeader from '~/features/templates/admin/components/CertificateHeader.vue'
import { useCertificateTemplateStore } from '~/features/templates/admin/stores/certificateTemplate'
import { useCertificateTemplates } from '~/features/templates/admin/composables/useCertificateTemplates'
import { useCurrencySettingsStore } from '~/features/settings/admin/stores/currencySettings'
import { useProducts } from '~/features/products/admin/composables/useProducts'
import { useAdminEdit } from '~/features/_admin/composables/useAdminEdit'
import { useGeneratePdf } from '~/features/templates/admin/composables/useGeneratePdf'
import {
  certificateOpenAccordionId,
  certificatePreviewProductId
} from '~/features/templates/admin/forms/certificate-template-form'
import { Button } from '@/components/ui/button'
import { Download, Loader2 } from 'lucide-vue-next'

definePageMeta({ layout: 'admin' })

const route = useRoute()
const { getTemplateById, updateTemplateName, updateTemplateStatus, deleteTemplate } =
  useCertificateTemplates()
const store = useCertificateTemplateStore()
const currencyStore = useCurrencySettingsStore()
const { products } = useProducts()

const template = computed(() => getTemplateById(route.params.id as string))

// Reset shared UI state
certificateOpenAccordionId.value = undefined
certificatePreviewProductId.value = undefined

// Initialize store synchronously
if (template.value) {
  store.initialize(template.value)
}

onMounted(() => {
  if (!template.value) {
    navigateTo('/admin/templates/certificates')
  }
})

onUnmounted(() => {
  certificateOpenAccordionId.value = undefined
  certificatePreviewProductId.value = undefined
})

// Watch for route param changes
watch(
  () => route.params.id,
  (newId) => {
    certificateOpenAccordionId.value = undefined
    certificatePreviewProductId.value = undefined
    const t = getTemplateById(newId as string)
    if (t) store.initialize(t)
  }
)

const previewCurrency = ref(currencyStore.defaultCurrency)
const editableMode = ref(true)

const previewProduct = computed(() =>
  certificatePreviewProductId.value
    ? products.value.find((p) => p.id === certificatePreviewProductId.value)
    : undefined
)

const originalData = computed(() => store.id ? store.toSnapshot() : undefined)

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

const { isGenerating, downloadPdf } = useGeneratePdf()

const breadcrumbs = computed(() => [
  { label: 'Dashboard', href: '/admin/dashboard' },
  { label: 'Templates', href: '#' },
  { label: 'Certificates', href: '/admin/templates/certificates' },
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
  navigateTo('/admin/templates/certificates')
}
</script>

<template>
  <div v-if="template">
    <AdminEditLayout
      v-model:editable="editableMode"
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
        <CertificateHeader
          @update:name="handleNameUpdate"
          @update:status="handleStatusUpdate"
          @deleted="handleDeleted"
        />
      </template>

      <template #content>
        <div class="space-y-6">
          <CertificateTemplateConfig
            ref="formConfigRef"
            @save="handleSave"
            @discard="handleDiscard"
          />
        </div>
      </template>

      <template #preview-actions>
        <Button
          variant="outline"
          size="sm"
          :disabled="isGenerating"
          @click="
            downloadPdf('certificate', { currency: previewCurrency, product: previewProduct })
          "
        >
          <Loader2 v-if="isGenerating" class="w-4 h-4 mr-2 animate-spin" />
          <Download v-else class="w-4 h-4 mr-2" />
          PDF
        </Button>
      </template>

      <template #preview>
        <CertificatePreview
          :currency="previewCurrency"
          :product="previewProduct"
          :editable="editableMode"
        />
      </template>
    </AdminEditLayout>
  </div>
</template>
