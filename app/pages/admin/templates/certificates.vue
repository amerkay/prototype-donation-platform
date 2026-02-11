<script setup lang="ts">
import { ref, computed } from 'vue'
import AdminEditLayout from '~/features/_admin/components/AdminEditLayout.vue'
import CertificateTemplateConfig from '~/features/templates/admin/components/CertificateTemplateConfig.vue'
import CertificatePreview from '~/features/templates/admin/components/CertificatePreview.vue'
import BaseDialogOrDrawer from '~/components/BaseDialogOrDrawer.vue'
import { useCertificateTemplateStore } from '~/features/templates/admin/stores/certificateTemplate'
import { useCurrencySettingsStore } from '~/features/settings/admin/stores/currencySettings'
import { useAdminEdit } from '~/features/_admin/composables/useAdminEdit'
import { useGeneratePdf } from '~/features/templates/admin/composables/useGeneratePdf'
import { getLayoutOrientation } from '~/features/templates/admin/utils/page-geometry'
import { Button } from '@/components/ui/button'
import { Download, Loader2 } from 'lucide-vue-next'

definePageMeta({ layout: 'admin' })

const store = useCertificateTemplateStore()
const currencyStore = useCurrencySettingsStore()

const previewCurrency = ref(currencyStore.defaultCurrency)

const originalData = computed(() => ({
  certificate: {
    header: {
      ...store.certificate.header
    },
    awardBlock: {
      ...store.certificate.awardBlock
    },
    body: {
      ...store.certificate.body
    },
    productSettings: {
      ...store.certificate.productSettings
    },
    signatureSettings: {
      ...store.certificate.signatureSettings
    },
    dateSettings: {
      ...store.certificate.dateSettings
    },
    footerSettings: {
      ...store.certificate.footerSettings
    },
    design: {
      ...store.certificate.design
    }
  }
}))

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

const showPreviewDialog = ref(false)

const previewMaxWidth = computed(() =>
  getLayoutOrientation(store.certificate.design.layout) === 'landscape'
    ? 'sm:max-w-3xl'
    : 'sm:max-w-xl'
)

const { isGenerating, downloadPdf } = useGeneratePdf()

const breadcrumbs = [
  { label: 'Dashboard', href: '/admin/dashboard' },
  { label: 'Templates', href: '#' },
  { label: 'Certificates' }
]
</script>

<template>
  <div>
    <AdminEditLayout
      :breadcrumbs="breadcrumbs"
      :is-dirty="store.isDirty"
      :show-discard-dialog="showDiscardDialog"
      :show-preview="true"
      @update:show-discard-dialog="showDiscardDialog = $event"
      @confirm-discard="confirmDiscard"
      @preview="showPreviewDialog = true"
    >
      <template #content>
        <div class="space-y-6">
          <CertificateTemplateConfig
            ref="formConfigRef"
            @save="handleSave"
            @discard="handleDiscard"
            @preview="showPreviewDialog = true"
          />
        </div>
      </template>

      <template #preview-actions>
        <Button
          variant="outline"
          size="sm"
          :disabled="isGenerating"
          @click="downloadPdf('certificate', previewCurrency)"
        >
          <Loader2 v-if="isGenerating" class="w-4 h-4 mr-2 animate-spin" />
          <Download v-else class="w-4 h-4 mr-2" />
          PDF
        </Button>
      </template>

      <template #preview>
        <CertificatePreview :currency="previewCurrency" editable />
      </template>
    </AdminEditLayout>

    <BaseDialogOrDrawer
      :open="showPreviewDialog"
      description="How the certificate will appear to donors."
      :max-width="previewMaxWidth"
      @update:open="showPreviewDialog = $event"
    >
      <template #header>Certificate Preview</template>
      <template #content>
        <CertificatePreview :currency="previewCurrency" />
      </template>
    </BaseDialogOrDrawer>
  </div>
</template>
