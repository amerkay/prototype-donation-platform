<script setup lang="ts">
import { ref, computed } from 'vue'
import EditLayout from '~/features/_shared/components/EditLayout.vue'
import DonorPortalSettingsConfig from '~/features/settings/admin/components/DonorPortalSettingsConfig.vue'
import { useDonorPortalSettingsStore } from '~/features/settings/admin/stores/donorPortalSettings'
import { useEditState } from '~/features/_shared/composables/useEditState'

const store = useDonorPortalSettingsStore()

const originalData = computed(() => ({
  pauseSubscription: { ...store.pauseSubscription },
  cancelSubscription: { ...store.cancelSubscription },
  refundOneTime: { ...store.refundOneTime },
  refundSubscription: { ...store.refundSubscription }
}))

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
  { label: 'Donor Portal' }
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
      <DonorPortalSettingsConfig ref="formConfigRef" @save="handleSave" @discard="handleDiscard" />
    </template>
  </EditLayout>
</template>
