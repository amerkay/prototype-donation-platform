<script setup lang="ts">
import { ref, computed } from 'vue'
import AdminEditLayout from '~/features/_admin/components/AdminEditLayout.vue'
import ReceiptTemplateConfig from '~/features/templates/admin/components/ReceiptTemplateConfig.vue'
import ReceiptPreview from '~/features/templates/admin/components/ReceiptPreview.vue'
import { useReceiptTemplateStore } from '~/features/templates/admin/stores/receiptTemplate'
import { useCurrencySettingsStore } from '~/features/settings/admin/stores/currencySettings'
import { useAdminEdit } from '~/features/_admin/composables/useAdminEdit'
import { useGeneratePdf } from '~/features/templates/admin/composables/useGeneratePdf'
import { Button } from '@/components/ui/button'
import { Download, Loader2 } from 'lucide-vue-next'
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

const { isGenerating, downloadPdf } = useGeneratePdf()

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
          <ReceiptTemplateConfig ref="formConfigRef" @save="handleSave" @discard="handleDiscard" />
        </div>
      </template>

      <template #preview-actions>
        <Select v-if="currencyStore.supportedCurrencies.length > 1" v-model="previewCurrency">
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
        <Button
          variant="outline"
          size="sm"
          :disabled="isGenerating"
          @click="downloadPdf('receipt', { currency: previewCurrency })"
        >
          <Loader2 v-if="isGenerating" class="w-4 h-4 mr-2 animate-spin" />
          <Download v-else class="w-4 h-4 mr-2" />
          PDF
        </Button>
      </template>

      <template #preview>
        <ReceiptPreview :currency="previewCurrency" />
      </template>
    </AdminEditLayout>
  </div>
</template>
