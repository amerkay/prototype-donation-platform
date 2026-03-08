<script setup lang="ts">
import { ref, computed } from 'vue'
import EditLayout from '~/features/_shared/components/EditLayout.vue'
import ReceiptTemplateConfig from '~/features/templates/admin/components/ReceiptTemplateConfig.vue'
import ReceiptPreview from '~/features/templates/admin/components/ReceiptPreview.vue'
import { useReceiptTemplateStore } from '~/features/templates/admin/stores/receiptTemplate'
import { useCurrencySettingsStore } from '~/features/settings/admin/stores/currencySettings'
import { useEditState } from '~/features/_shared/composables/useEditState'
import { useGeneratePdf } from '~/features/templates/admin/composables/useGeneratePdf'
import { Button } from '@/components/ui/button'
import { ICON_DOWNLOAD, ICON_LOADING } from '~/lib/icons'
import PreviewCurrencySelect from '~/features/_admin/components/PreviewCurrencySelect.vue'

definePageMeta({ layout: 'admin' })

const store = useReceiptTemplateStore()
const currencyStore = useCurrencySettingsStore()

const previewCurrency = ref(currencyStore.defaultCurrency)
const editableMode = ref(true)

const originalData = computed(() => store.toSnapshot())

const formConfigRef = ref()

const { handleSave, handleDiscard, confirmDiscard, showDiscardDialog } = useEditState({
  store,
  formRef: formConfigRef,
  originalData,
  onSave: async () => {
    await new Promise((resolve) => setTimeout(resolve, 300))
    store.save()
  }
})

const { isGenerating, downloadPdf } = useGeneratePdf()

const breadcrumbs = [
  { label: 'Dashboard', href: '/admin/dashboard' },
  { label: 'Templates', href: '#' },
  { label: 'Receipts' }
]
</script>

<template>
  <div>
    <EditLayout
      v-model:editable="editableMode"
      :breadcrumbs="breadcrumbs"
      :is-dirty="store.isDirty"
      :show-discard-dialog="showDiscardDialog"
      :show-preview="false"
      @update:show-discard-dialog="showDiscardDialog = $event"
      @confirm-discard="confirmDiscard"
    >
      <template #content>
        <div class="space-y-6">
          <ReceiptTemplateConfig ref="formConfigRef" @save="handleSave" @discard="handleDiscard" />
        </div>
      </template>

      <template #preview-actions>
        <PreviewCurrencySelect
          v-model="previewCurrency"
          :currencies="currencyStore.supportedCurrencies"
        />
        <Button
          variant="outline"
          size="sm"
          :disabled="isGenerating"
          @click="downloadPdf('receipt', { currency: previewCurrency })"
        >
          <ICON_LOADING v-if="isGenerating" class="w-4 h-4 mr-2 animate-spin" />
          <ICON_DOWNLOAD v-else class="w-4 h-4 mr-2" />
          PDF
        </Button>
      </template>

      <template #preview>
        <ReceiptPreview :currency="previewCurrency" :editable="editableMode" />
      </template>
    </EditLayout>
  </div>
</template>
