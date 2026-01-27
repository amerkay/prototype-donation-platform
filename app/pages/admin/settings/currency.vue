<script setup lang="ts">
import { ref, computed } from 'vue'
import AdminEditLayout from '~/features/_admin/components/AdminEditLayout.vue'
import CurrencySettingsConfig from '~/features/settings/admin/components/CurrencySettingsConfig.vue'
import { useCurrencySettingsStore } from '~/features/settings/admin/stores/currencySettings'
import { useAdminEdit } from '~/features/_admin/composables/useAdminEdit'
import { toast } from 'vue-sonner'

// Initialize store
const store = useCurrencySettingsStore()

// Store original data for discard - capture initial state on mount
const initialData = {
  supportedCurrencies: [...store.supportedCurrencies]
}
const originalData = computed(() => initialData)

// Form config ref
const formConfigRef = ref()

// Use admin edit composable for save/discard logic
const { handleSave, handleDiscard, confirmDiscard, showDiscardDialog, formKey } = useAdminEdit({
  store,
  formRef: formConfigRef,
  originalData,
  onSave: async () => {
    // In real app, would call API here
    // await api.updateCurrencySettings(store)
    await new Promise((resolve) => setTimeout(resolve, 500))
    toast.success('Currency settings saved successfully')
    store.markClean()
    // Update initial data after successful save
    initialData.supportedCurrencies = [...store.supportedCurrencies]
  },
  onDiscard: (data) => {
    store.initialize(data)
  }
})

// Breadcrumbs
const breadcrumbs = [
  { label: 'Dashboard', href: '/' },
  { label: 'Settings', href: '#' },
  { label: 'Currency' }
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
    <!-- Main content -->
    <template #content>
      <div class="space-y-6">
        <div>
          <h1 class="text-2xl font-bold">Currency Settings</h1>
          <p class="text-muted-foreground mt-1">
            Configure default currencies for your organization. These settings apply to all donation
            forms unless overridden.
          </p>
        </div>

        <CurrencySettingsConfig
          :key="formKey"
          ref="formConfigRef"
          @save="handleSave"
          @discard="handleDiscard"
        />
      </div>
    </template>
  </AdminEditLayout>
</template>
