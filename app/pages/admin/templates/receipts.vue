<script setup lang="ts">
import { ref, computed } from 'vue'
import AdminEditLayout from '~/features/_admin/components/AdminEditLayout.vue'
import ReceiptTemplateConfig from '~/features/templates/admin/components/ReceiptTemplateConfig.vue'
import ReceiptPreview from '~/features/templates/admin/components/ReceiptPreview.vue'
import BaseDialogOrDrawer from '~/components/BaseDialogOrDrawer.vue'
import { useReceiptTemplateStore } from '~/features/templates/admin/stores/receiptTemplate'
import { useAdminEdit } from '~/features/_admin/composables/useAdminEdit'

definePageMeta({ layout: 'admin' })

const store = useReceiptTemplateStore()

const originalData = computed(() => ({
  headerText: store.headerText,
  footerText: store.footerText,
  showGiftAid: store.showGiftAid,
  showPaymentMethod: store.showPaymentMethod,
  showCampaignName: store.showCampaignName
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

const breadcrumbs = [
  { label: 'Dashboard', href: '/admin/dashboard' },
  { label: 'Templates', href: '#' },
  { label: 'Receipts' }
]
</script>

<template>
  <div>
    <AdminEditLayout
      :breadcrumbs="breadcrumbs"
      :is-dirty="store.isDirty"
      :show-discard-dialog="showDiscardDialog"
      :show-preview="false"
      @update:show-discard-dialog="showDiscardDialog = $event"
      @confirm-discard="confirmDiscard"
    >
      <template #content>
        <div class="space-y-6">
          <ReceiptTemplateConfig
            ref="formConfigRef"
            @save="handleSave"
            @discard="handleDiscard"
            @preview="showPreviewDialog = true"
          />
        </div>
      </template>

      <template #preview>
        <ReceiptPreview />
      </template>
    </AdminEditLayout>

    <BaseDialogOrDrawer
      :open="showPreviewDialog"
      description="How the receipt will appear to donors."
      max-width="sm:max-w-lg"
      @update:open="showPreviewDialog = $event"
    >
      <template #header>Receipt Preview</template>
      <template #content>
        <ReceiptPreview />
      </template>
    </BaseDialogOrDrawer>
  </div>
</template>
