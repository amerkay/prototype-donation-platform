<script setup lang="ts">
import { computed, ref } from 'vue'
import AdminEditLayout from '~/features/_admin/components/AdminEditLayout.vue'
import CharitySettingsConfig from '~/features/settings/admin/components/CharitySettingsConfig.vue'
import CharitySettingsPreview from '~/features/settings/admin/components/CharitySettingsPreview.vue'
import PreviewCurrencySelect from '~/features/_admin/components/PreviewCurrencySelect.vue'
import BaseDialogOrDrawer from '~/components/BaseDialogOrDrawer.vue'
import { useCharitySettingsStore } from '~/features/settings/admin/stores/charitySettings'
import { useCurrencySettingsStore } from '~/features/settings/admin/stores/currencySettings'
import { useAdminEdit } from '~/features/_admin/composables/useAdminEdit'

const store = useCharitySettingsStore()

const originalData = computed(() => store.toSnapshot())
const editableMode = ref(true)

const formConfigRef = ref()
const previewRef = ref<InstanceType<typeof CharitySettingsPreview>>()

const { handleSave, handleDiscard, confirmDiscard, showDiscardDialog } = useAdminEdit({
  store,
  formRef: formConfigRef,
  originalData,
  onSave: async () => {
    await new Promise((resolve) => setTimeout(resolve, 300))
    store.save()
  }
})

const currencyStore = useCurrencySettingsStore()
const selectedCurrency = ref(currencyStore.defaultCurrency)
const showPreviewDialog = ref(false)

const breadcrumbs = [
  { label: 'Dashboard', href: '/' },
  { label: 'Settings', href: '#' },
  { label: 'Charity' }
]

definePageMeta({
  layout: 'admin'
})
</script>

<template>
  <div>
    <AdminEditLayout
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
          <CharitySettingsConfig
            ref="formConfigRef"
            @save="handleSave"
            @discard="handleDiscard"
            @preview="showPreviewDialog = true"
          />
        </div>
      </template>

      <template #preview-actions>
        <PreviewCurrencySelect
          v-if="previewRef?.activeTab === 'receipt'"
          :model-value="selectedCurrency"
          :currencies="currencyStore.supportedCurrencies"
          @update:model-value="selectedCurrency = $event"
        />
      </template>

      <template #preview>
        <CharitySettingsPreview
          ref="previewRef"
          v-model:selected-currency="selectedCurrency"
          :editable="editableMode"
        />
      </template>
    </AdminEditLayout>

    <BaseDialogOrDrawer
      :open="showPreviewDialog"
      description="See how your charity details appear on receipts and campaign pages."
      size="md"
      @update:open="showPreviewDialog = $event"
    >
      <template #header>Charity Preview</template>
      <template #content>
        <CharitySettingsPreview
          v-model:selected-currency="selectedCurrency"
          :editable="editableMode"
        />
      </template>
    </BaseDialogOrDrawer>
  </div>
</template>
