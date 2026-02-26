<script setup lang="ts">
import { computed, ref } from 'vue'
import EditLayout from '~/features/_shared/components/EditLayout.vue'
import CharitySettingsConfig from '~/features/settings/admin/components/CharitySettingsConfig.vue'
import CharitySettingsPreview from '~/features/settings/admin/components/CharitySettingsPreview.vue'
import BaseDialogOrDrawer from '~/components/BaseDialogOrDrawer.vue'
import { useCharitySettingsStore } from '~/features/settings/admin/stores/charitySettings'
import { useEditState } from '~/features/_shared/composables/useEditState'

const store = useCharitySettingsStore()

const originalData = computed(() => store.toSnapshot())
const editableMode = ref(true)

const formConfigRef = ref()
const previewRef = ref<InstanceType<typeof CharitySettingsPreview>>()

const { handleSave, handleDiscard, confirmDiscard, showDiscardDialog } = useEditState({
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
          <CharitySettingsConfig
            ref="formConfigRef"
            @save="handleSave"
            @discard="handleDiscard"
            @preview="showPreviewDialog = true"
          />
        </div>
      </template>

      <template #preview>
        <CharitySettingsPreview ref="previewRef" :editable="editableMode" />
      </template>
    </EditLayout>

    <BaseDialogOrDrawer
      :open="showPreviewDialog"
      description="See how your charity details appear on receipts and campaign pages."
      size="md"
      @update:open="showPreviewDialog = $event"
    >
      <template #header>Charity Preview</template>
      <template #content>
        <CharitySettingsPreview :editable="editableMode" />
      </template>
    </BaseDialogOrDrawer>
  </div>
</template>
