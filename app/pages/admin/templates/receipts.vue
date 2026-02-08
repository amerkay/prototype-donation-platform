<script setup lang="ts">
import { ref, computed } from 'vue'
import AdminEditLayout from '~/features/_admin/components/AdminEditLayout.vue'
import ReceiptTemplateConfig from '~/features/templates/admin/components/ReceiptTemplateConfig.vue'
import ReceiptPreview from '~/features/templates/admin/components/ReceiptPreview.vue'
import BaseDialogOrDrawer from '~/components/BaseDialogOrDrawer.vue'
import { useReceiptTemplateStore } from '~/features/templates/admin/stores/receiptTemplate'
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

const store = useReceiptTemplateStore()
const currencyStore = useCurrencySettingsStore()

const previewCurrency = ref(currencyStore.defaultCurrency)

const originalData = computed(() => ({
  headerText: store.headerText,
  footerText: store.footerText,
  showGiftAid: store.showGiftAid,
  showPaymentMethod: store.showPaymentMethod,
  showCampaignName: store.showCampaignName,
  showLogo: store.showLogo
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
      :show-preview="true"
      @update:show-discard-dialog="showDiscardDialog = $event"
      @confirm-discard="confirmDiscard"
      @preview="showPreviewDialog = true"
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

      <template v-if="currencyStore.supportedCurrencies.length > 1" #preview-actions>
        <Select v-model="previewCurrency">
          <SelectTrigger class="h-8! w-20 text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem
              v-for="c in currencyStore.supportedCurrencies"
              :key="c"
              :value="c"
              class="text-xs"
            >
              {{ c }}
            </SelectItem>
          </SelectContent>
        </Select>
      </template>

      <template #preview>
        <ReceiptPreview :currency="previewCurrency" />
      </template>
    </AdminEditLayout>

    <BaseDialogOrDrawer
      :open="showPreviewDialog"
      description="How the receipt will appear to donors."
      max-width="sm:max-w-xl"
      @update:open="showPreviewDialog = $event"
    >
      <template #header>Receipt Preview</template>
      <template #content>
        <ReceiptPreview :currency="previewCurrency" />
      </template>
    </BaseDialogOrDrawer>
  </div>
</template>
