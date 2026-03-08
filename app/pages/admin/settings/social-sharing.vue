<script setup lang="ts">
import { ref, computed } from 'vue'
import EditLayout from '~/features/_shared/components/EditLayout.vue'
import SocialSharingSettingsConfig from '~/features/settings/admin/components/SocialSharingSettingsConfig.vue'
import SocialSharingPreview from '~/features/settings/admin/components/SocialSharingPreview.vue'
import { useSocialSharingSettingsStore } from '~/features/settings/admin/stores/socialSharingSettings'
import { useEditState } from '~/features/_shared/composables/useEditState'

const store = useSocialSharingSettingsStore()

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
  { label: 'Social Sharing' }
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
      <SocialSharingSettingsConfig
        ref="formConfigRef"
        @save="handleSave"
        @discard="handleDiscard"
      />
    </template>

    <template #preview>
      <SocialSharingPreview />
    </template>
  </EditLayout>
</template>
