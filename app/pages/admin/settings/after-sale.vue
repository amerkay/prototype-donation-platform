<script setup lang="ts">
import { ref, computed } from 'vue'
import AdminEditLayout from '~/features/_admin/components/AdminEditLayout.vue'
import AfterSaleSettingsConfig from '~/features/settings/admin/components/AfterSaleSettingsConfig.vue'
import AfterSalePreview from '~/features/settings/admin/components/AfterSalePreview.vue'
import { useAfterSaleSettingsStore } from '~/features/settings/admin/stores/afterSaleSettings'
import { useAdminEdit } from '~/features/_admin/composables/useAdminEdit'

const store = useAfterSaleSettingsStore()

const originalData = computed(() => ({
  recurringUpsellEnabled: store.recurringUpsellEnabled,
  recurringUpsellFraction: store.recurringUpsellFraction,
  recurringUpsellHeadline: store.recurringUpsellHeadline,
  recurringUpsellBody: store.recurringUpsellBody,
  socialSharingEnabled: store.socialSharingEnabled,
  socialSharingMessage: store.socialSharingMessage
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

const breadcrumbs = [
  { label: 'Dashboard', href: '/admin/dashboard' },
  { label: 'Settings', href: '#' },
  { label: 'After Sale' }
]

definePageMeta({ layout: 'admin' })
</script>

<template>
  <AdminEditLayout
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
  </AdminEditLayout>
</template>
