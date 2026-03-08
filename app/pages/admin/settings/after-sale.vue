<script setup lang="ts">
import { ref, computed } from 'vue'
import EditLayout from '~/features/_shared/components/EditLayout.vue'
import AfterSaleSettingsConfig from '~/features/settings/admin/components/AfterSaleSettingsConfig.vue'
import AfterSalePreview from '~/features/settings/admin/components/AfterSalePreview.vue'
import { useAfterSaleSettingsStore } from '~/features/settings/admin/stores/afterSaleSettings'
import { useEditState } from '~/features/_shared/composables/useEditState'

const store = useAfterSaleSettingsStore()

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

const breadcrumbs = [
  { label: 'Dashboard', href: '/admin/dashboard' },
  { label: 'Settings', href: '#' },
  { label: 'After Sale' }
]

definePageMeta({ layout: 'admin' })
</script>

<template>
  <EditLayout
    :breadcrumbs="breadcrumbs"
    :is-dirty="store.isDirty"
    :show-discard-dialog="showDiscardDialog"
    :show-preview="false"
    @update:show-discard-dialog="showDiscardDialog = $event"
    @confirm-discard="confirmDiscard"
  >
    <template #content>
      <AfterSaleSettingsConfig ref="formConfigRef" @save="handleSave" @discard="handleDiscard" />
    </template>

    <template #preview>
      <AfterSalePreview />
    </template>
  </EditLayout>
</template>
