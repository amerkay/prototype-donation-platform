<script setup lang="ts">
import { computed, ref } from 'vue'
import AdminEditLayout from '~/features/_admin/components/AdminEditLayout.vue'
import CharitySettingsConfig from '~/features/settings/admin/components/CharitySettingsConfig.vue'
import { useCharitySettingsStore } from '~/features/settings/admin/stores/charitySettings'
import { useAdminEdit } from '~/features/_admin/composables/useAdminEdit'

const store = useCharitySettingsStore()

const originalData = computed(() => store.toSnapshot())

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
  { label: 'Dashboard', href: '/' },
  { label: 'Settings', href: '#' },
  { label: 'Charity' }
]

definePageMeta({
  layout: 'admin'
})
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
        <CharitySettingsConfig ref="formConfigRef" @save="handleSave" @discard="handleDiscard" />
      </div>
    </template>
  </AdminEditLayout>
</template>
