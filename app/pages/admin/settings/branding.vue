<script setup lang="ts">
import { ref, computed } from 'vue'
import AdminEditLayout from '~/features/_admin/components/AdminEditLayout.vue'
import BrandingSettingsConfig from '~/features/settings/admin/components/BrandingSettingsConfig.vue'
import BrandingPreview from '~/features/settings/admin/components/BrandingPreview.vue'
import BaseDialogOrDrawer from '~/components/BaseDialogOrDrawer.vue'
import { useBrandingSettingsStore } from '~/features/settings/admin/stores/brandingSettings'
import { useAdminEdit } from '~/features/_admin/composables/useAdminEdit'

const store = useBrandingSettingsStore()

const originalData = computed(() => ({
  logoUrl: store.logoUrl,
  primaryColor: store.primaryColor,
  secondaryColor: store.secondaryColor,
  fontFamily: store.fontFamily,
  customCss: store.customCss
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

const showPreviewDialog = ref(false)

const breadcrumbs = [
  { label: 'Dashboard', href: '/admin/dashboard' },
  { label: 'Settings', href: '#' },
  { label: 'Branding' }
]

definePageMeta({ layout: 'admin' })
</script>

<template>
  <div>
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
          <BrandingSettingsConfig
            ref="formConfigRef"
            @save="handleSave"
            @discard="handleDiscard"
            @preview="showPreviewDialog = true"
          />
        </div>
      </template>

      <template #preview>
        <BrandingPreview />
      </template>
    </AdminEditLayout>

    <BaseDialogOrDrawer
      :open="showPreviewDialog"
      description="See how your branding appears across the platform."
      max-width="sm:max-w-lg"
      @update:open="showPreviewDialog = $event"
    >
      <template #header>Branding Preview</template>
      <template #content>
        <BrandingPreview />
      </template>
    </BaseDialogOrDrawer>
  </div>
</template>
