<script setup lang="ts">
import { ref, computed } from 'vue'
import AdminEditLayout from '~/features/_admin/components/AdminEditLayout.vue'
import SocialSharingSettingsConfig from '~/features/settings/admin/components/SocialSharingSettingsConfig.vue'
import SocialSharingPreview from '~/features/settings/admin/components/SocialSharingPreview.vue'
import { useSocialSharingSettingsStore } from '~/features/settings/admin/stores/socialSharingSettings'
import { useAdminEdit } from '~/features/_admin/composables/useAdminEdit'

const store = useSocialSharingSettingsStore()

const originalData = computed(() => ({
  facebook: store.facebook,
  twitter: store.twitter,
  linkedin: store.linkedin,
  whatsapp: store.whatsapp,
  email: store.email
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
  { label: 'Social Sharing' }
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
      <SocialSharingSettingsConfig
        ref="formConfigRef"
        @save="handleSave"
        @discard="handleDiscard"
      />
    </template>

    <template #preview>
      <SocialSharingPreview />
    </template>
  </AdminEditLayout>
</template>
