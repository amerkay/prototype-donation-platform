<script setup lang="ts">
import { watch } from 'vue'
import DonationFlowWizard from '~/features/donation-form/donor/DonationFlowWizard.vue'
import DevJsonPreview from '~/features/_admin/components/DevJsonPreview.vue'
import PreviewEditable from '~/features/_admin/components/PreviewEditable.vue'
import { useFormConfigStore } from '~/features/donation-form/shared/stores/formConfig'
import { useDonationFormStore } from '~/features/donation-form/donor/stores/donationForm'
import { extractCustomFieldDefaults } from '~/features/_library/custom-fields/utils'
import { HASH_TARGET_PASSIVE_KEY } from '~/features/_library/form-builder/composables/useHashTarget'

withDefaults(
  defineProps<{
    editable?: boolean
  }>(),
  { editable: false }
)

// Prevent preview FormRenderers from stealing the global hash target activator
provide(HASH_TARGET_PASSIVE_KEY, true)

// Get shared form config from store
const store = useFormConfigStore()
const donationStore = useDonationFormStore()

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
    <PreviewEditable :enabled="editable" class="bg-muted/50 rounded-xl w-full border">
      <DonationFlowWizard :config="store.fullConfig" />
    </PreviewEditable>
    <DevJsonPreview :data="donationStore.completeState" />
  </div>
</template>
