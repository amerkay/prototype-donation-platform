<script setup lang="ts">
import { ref, computed } from 'vue'
import AdminEditLayout from '~/features/_admin/components/AdminEditLayout.vue'
import CurrencySettingsConfig from '~/features/settings/admin/components/CurrencySettingsConfig.vue'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from '@/components/ui/alert-dialog'
import { useCurrencySettingsStore } from '~/features/settings/admin/stores/currencySettings'
import { useAdminEdit } from '~/features/_admin/composables/useAdminEdit'

const store = useCurrencySettingsStore()

const originalData = computed(() => ({
  supportedCurrencies: [...store.supportedCurrencies],
  defaultCurrency: store.defaultCurrency,
  currencyMultipliers: { ...store.currencyMultipliers }
}))

const formConfigRef = ref()
const showCharityCheckDialog = ref(false)
const lastSavedDefaultCurrency = ref(store.defaultCurrency)

const {
  handleSave: _handleSave,
  handleDiscard,
  confirmDiscard,
  showDiscardDialog
} = useAdminEdit({
  store,
  formRef: formConfigRef,
  originalData,
  onSave: async () => {
    await new Promise((resolve) => setTimeout(resolve, 300))
    store.save()
  }
})

async function handleSave() {
  const defaultCurrencyChanged = store.defaultCurrency !== lastSavedDefaultCurrency.value
  await _handleSave()
  // Show charity check prompt only when default org currency actually changed
  if (!store.isDirty) {
    if (defaultCurrencyChanged) {
      showCharityCheckDialog.value = true
    }
    lastSavedDefaultCurrency.value = store.defaultCurrency
  }
}

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
          <CurrencySettingsConfig ref="formConfigRef" @save="handleSave" @discard="handleDiscard" />
        </div>
      </template>
    </AdminEditLayout>

    <!-- Post-save: remind to check charity settings -->
    <AlertDialog v-model:open="showCharityCheckDialog">
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Check Charity Information</AlertDialogTitle>
          <AlertDialogDescription>
            Currency settings saved. Make sure your charity name, registration number, and address
            are correct for the updated currency configuration.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Dismiss</AlertDialogCancel>
          <AlertDialogAction as-child>
            <NuxtLink to="/admin/settings/charity">Review Charity Settings</NuxtLink>
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  </div>
</template>
