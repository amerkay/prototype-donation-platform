<script setup lang="ts">
import { watch } from 'vue'
import DonationFlowWizard from '~/features/donation-form/donor/DonationFlowWizard.vue'
import { useFormConfigStore } from '~/features/donation-form/shared/stores/formConfig'
import { useDonationFormStore } from '~/features/donation-form/donor/stores/donationForm'
import { extractCustomFieldDefaults } from '~/features/_library/custom-fields/utils'

// Get shared form config from store
const store = useFormConfigStore()
const donationStore = useDonationFormStore()
const isDev = import.meta.dev

// ==================== ADMIN PREVIEW SYNC ====================
// These watchers ensure the preview updates immediately when config changes

// 1. Sync currency changes
watch(
  () => store.donationAmounts?.baseDefaultCurrency,
  (newCurrency) => {
    if (newCurrency) {
      donationStore.setCurrency(newCurrency)
    }
  },
  { immediate: true }
)

// 2. Sync custom fields changes (cleanup orphaned + update defaults)
watch(
  () => store.customFields,
  (config) => {
    if (!config) return

    const currentData = donationStore.formSections.customFields || {}
    const tabs = config.customFieldsTabs

    // Extract valid field IDs and their defaults from config
    const validFields = new Set<string>()
    const fieldDefaults: Record<string, unknown> = {}

    for (const [_tabKey, tabConfig] of Object.entries(tabs)) {
      if (tabConfig.enabled && Array.isArray(tabConfig.fields)) {
        tabConfig.fields.forEach((field) => validFields.add(field.id))
        Object.assign(fieldDefaults, extractCustomFieldDefaults(tabConfig.fields))
      }
    }

    // Build updated data: remove orphaned fields + add/update defaults
    const updatedData: Record<string, unknown> = {}

    // Keep existing valid fields
    for (const [fieldId, value] of Object.entries(currentData)) {
      if (validFields.has(fieldId)) {
        updatedData[fieldId] = value
      }
    }

    // Add new fields or update when defaults change
    for (const [fieldId, defaultValue] of Object.entries(fieldDefaults)) {
      if (!(fieldId in updatedData) || updatedData[fieldId] !== defaultValue) {
        updatedData[fieldId] = defaultValue
      }
    }

    // Update if anything changed
    if (JSON.stringify(currentData) !== JSON.stringify(updatedData)) {
      donationStore.updateFormSection('customFields', updatedData)
    }
  },
  { deep: true, immediate: true }
)
</script>

<template>
  <div v-if="store.fullConfig" class="space-y-4">
    <div class="bg-muted/50 rounded-xl w-full border">
      <DonationFlowWizard :config="store.fullConfig" />
    </div>
    <pre v-if="isDev" class="bg-muted/50 rounded-xl p-4 text-xs overflow-auto max-h-96 border">{{
      JSON.stringify(donationStore.completeState, null, 2)
    }}</pre>
  </div>
</template>
