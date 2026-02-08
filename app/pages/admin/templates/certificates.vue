<script setup lang="ts">
import { ref, computed } from 'vue'
import AdminEditLayout from '~/features/_admin/components/AdminEditLayout.vue'
import CertificateTemplateConfig from '~/features/templates/admin/components/CertificateTemplateConfig.vue'
import CertificatePreview from '~/features/templates/admin/components/CertificatePreview.vue'
import BaseDialogOrDrawer from '~/components/BaseDialogOrDrawer.vue'
import { useCertificateTemplateStore } from '~/features/templates/admin/stores/certificateTemplate'
import { useCurrencySettingsStore } from '~/features/settings/admin/stores/currencySettings'
import { useAdminEdit } from '~/features/_admin/composables/useAdminEdit'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'

definePageMeta({ layout: 'admin' })

const store = useCertificateTemplateStore()
const currencyStore = useCurrencySettingsStore()

const previewCurrency = ref(currencyStore.defaultCurrency)

const originalData = computed(() => ({
  title: store.title,
  subtitle: store.subtitle,
  bodyText: store.bodyText,
  borderStyle: store.borderStyle,
  showLogo: store.showLogo,
  showDate: store.showDate,
  showSignature: store.showSignature,
  signatureName: store.signatureName,
  signatureTitle: store.signatureTitle,
  orientation: store.orientation,
  backgroundImage: store.backgroundImage
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
  store.orientation === 'landscape' ? 'sm:max-w-3xl' : 'sm:max-w-xl'
)

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

      <template #preview>
        <CertificatePreview :currency="previewCurrency" />
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
