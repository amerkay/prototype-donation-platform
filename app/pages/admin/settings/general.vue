<script setup lang="ts">
import { ref, computed } from 'vue'
import AdminEditLayout from '~/features/_admin/components/AdminEditLayout.vue'
import GeneralSettingsConfig from '~/features/settings/admin/components/GeneralSettingsConfig.vue'
import { useGeneralSettingsStore } from '~/features/settings/admin/stores/generalSettings'
import { useAdminEdit } from '~/features/_admin/composables/useAdminEdit'

const store = useGeneralSettingsStore()

const originalData = computed(() => ({
  timezone: store.timezone,
  dateFormat: store.dateFormat
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
  { label: 'General' }
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
      <div class="space-y-6">
        <GeneralSettingsConfig ref="formConfigRef" @save="handleSave" @discard="handleDiscard" />
      </div>
    </template>
  </AdminEditLayout>
</template>
