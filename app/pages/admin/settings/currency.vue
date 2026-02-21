<script setup lang="ts">
import { ref, computed } from 'vue'
import AdminEditLayout from '~/features/_admin/components/AdminEditLayout.vue'
import CurrencySettingsConfig from '~/features/settings/admin/components/CurrencySettingsConfig.vue'
import CurrencyConversionPreview from '~/features/settings/admin/components/CurrencyConversionPreview.vue'
import CurrencyInUseDialog from '~/features/settings/admin/components/CurrencyInUseDialog.vue'
import CurrencyBatchRemoveDialog from '~/features/settings/admin/components/CurrencyBatchRemoveDialog.vue'
import { useCurrencySettingsStore } from '~/features/settings/admin/stores/currencySettings'
import { useAdminEdit } from '~/features/_admin/composables/useAdminEdit'
import { useCampaigns } from '~/features/campaigns/shared/composables/useCampaigns'
import { useFormsStore } from '~/features/campaigns/shared/stores/forms'
import {
  findFormsUsingCurrencies,
  stripCurrenciesFromForms
} from '~/features/settings/admin/composables/useCurrencyGuards'
import type { AffectedForm } from '~/features/settings/admin/composables/useCurrencyGuards'

const store = useCurrencySettingsStore()

const { campaigns } = useCampaigns()
const formsStore = useFormsStore()

const originalData = computed(() => store.toSnapshot())

const formConfigRef = ref()

const showCurrencyInUseDialog = ref(false)
const blockedCurrencies = ref<string[]>([])
const blockedForms = ref<AffectedForm[]>([])

const showBatchRemoveDialog = ref(false)
const batchRemoveCurrencies = ref<string[]>([])
const batchRemoveForms = ref<AffectedForm[]>([])
/** Store campaign/form IDs for batch strip (need them beyond dialog display) */
const batchRemoveFormIds = ref<Array<{ campaignId: string; formId: string }>>([])

const lastSavedSupported = ref([...store.supportedCurrencies])

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
    lastSavedSupported.value = [...store.supportedCurrencies]
  }
})

async function handleSave() {
  const removedCurrencies = new Set(
    lastSavedSupported.value.filter((c) => !store.supportedCurrencies.includes(c))
  )

  if (removedCurrencies.size > 0) {
    const { defaultBlocked, enabledOnly, enabledOnlyIds } = findFormsUsingCurrencies(
      removedCurrencies,
      campaigns.value,
      formsStore
    )

    // Tier 1: block if any form uses removed currency as default
    if (defaultBlocked.length > 0) {
      blockedCurrencies.value = [...removedCurrencies]
      blockedForms.value = defaultBlocked
      showCurrencyInUseDialog.value = true
      return
    }

    // Tier 2: confirm batch strip if only in enabledCurrencies
    if (enabledOnly.length > 0) {
      batchRemoveCurrencies.value = [...removedCurrencies]
      batchRemoveForms.value = enabledOnly
      batchRemoveFormIds.value = enabledOnlyIds
      showBatchRemoveDialog.value = true
      return
    }
  }

  await _handleSave()
}

async function handleBatchConfirm() {
  showBatchRemoveDialog.value = false
  stripCurrenciesFromForms(batchRemoveCurrencies.value, batchRemoveFormIds.value, formsStore)
  await _handleSave()
}

function handleBatchCancel() {
  showBatchRemoveDialog.value = false
}

function discardFromDialog() {
  showCurrencyInUseDialog.value = false
  confirmDiscard()
}

function navigateFromBatchDialog(href: string) {
  showBatchRemoveDialog.value = false
  confirmDiscard()
  navigateTo(href)
}

function navigateFromDialog(href: string) {
  showCurrencyInUseDialog.value = false
  confirmDiscard()
  navigateTo(href)
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
      :show-preview="false"
      :show-discard-dialog="showDiscardDialog"
      @update:show-discard-dialog="showDiscardDialog = $event"
      @confirm-discard="confirmDiscard"
    >
      <template #content>
        <div class="space-y-6">
          <CurrencySettingsConfig ref="formConfigRef" @save="handleSave" @discard="handleDiscard" />
        </div>
      </template>

      <template #preview>
        <CurrencyConversionPreview />
      </template>
    </AdminEditLayout>

    <CurrencyInUseDialog
      :open="showCurrencyInUseDialog"
      :currencies="blockedCurrencies"
      :forms="blockedForms"
      @update:open="showCurrencyInUseDialog = $event"
      @discard="discardFromDialog"
      @navigate="navigateFromDialog"
    />

    <CurrencyBatchRemoveDialog
      :open="showBatchRemoveDialog"
      :currencies="batchRemoveCurrencies"
      :forms="batchRemoveForms"
      @update:open="showBatchRemoveDialog = $event"
      @confirm="handleBatchConfirm"
      @cancel="handleBatchCancel"
      @navigate="navigateFromBatchDialog"
    />
  </div>
</template>
