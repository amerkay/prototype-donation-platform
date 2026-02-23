<script setup lang="ts">
import { ref, computed } from 'vue'
import AdminEditLayout from '~/features/_admin/components/AdminEditLayout.vue'
import DonorPortalSettingsConfig from '~/features/settings/admin/components/DonorPortalSettingsConfig.vue'
import { useDonorPortalSettingsStore } from '~/features/settings/admin/stores/donorPortalSettings'
import { useAdminEdit } from '~/features/_admin/composables/useAdminEdit'

const store = useDonorPortalSettingsStore()

const originalData = computed(() => ({
  pauseSubscription: { ...store.pauseSubscription },
  cancelSubscription: { ...store.cancelSubscription },
  requestRefund: { ...store.requestRefund }
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
  { label: 'Donor Portal' }
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
      <DonorPortalSettingsConfig ref="formConfigRef" @save="handleSave" @discard="handleDiscard" />
    </template>
  </AdminEditLayout>
</template>
