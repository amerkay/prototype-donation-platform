<script setup lang="ts">
import { ref, computed } from 'vue'
import AdminEditLayout from '~/features/_admin/components/AdminEditLayout.vue'
import CurrencySettingsConfig from '~/features/settings/admin/components/CurrencySettingsConfig.vue'
import { useCurrencySettingsStore } from '~/features/settings/admin/stores/currencySettings'
import { useAdminEdit } from '~/features/_admin/composables/useAdminEdit'

// Initialize store
const store = useCurrencySettingsStore()

// Original data for discard - capture complete store state
const originalData = computed(() => ({
  supportedCurrencies: [...store.supportedCurrencies],
  defaultCurrency: store.defaultCurrency,
  currencyMultipliers: { ...store.currencyMultipliers }
}))

// Form config ref
const formConfigRef = ref()

// Use admin edit composable for save/discard logic
const { handleSave, handleDiscard, confirmDiscard, showDiscardDialog } = useAdminEdit({
  store,
  formRef: formConfigRef,
  originalData,
  onSave: async () => {
    // In real app, would call API here
    // await api.updateCurrencySettings(store)
    await new Promise((resolve) => setTimeout(resolve, 500))
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

        <CurrencySettingsConfig ref="formConfigRef" @save="handleSave" @discard="handleDiscard" />
      </div>
    </template>
  </AdminEditLayout>
</template>
