<script setup lang="ts">
import { provide, watch } from 'vue'
import DonationFlowWizard from '~/features/donation-form/donor/DonationFlowWizard.vue'
import DevJsonPreview from '~/features/_admin/components/DevJsonPreview.vue'
import PreviewEditable from '~/features/_admin/components/PreviewEditable.vue'
import { useCampaignConfigStore } from '~/features/campaigns/shared/stores/campaignConfig'
import { useDonationFormStore } from '~/features/donation-form/donor/stores/donationForm'
import { extractCustomFieldDefaults } from '~/features/_library/custom-fields/utils'
import { HASH_TARGET_PASSIVE_KEY } from '~/features/_library/form-builder/composables/useHashTarget'
import {
  MATCHED_GIVING_KEY,
  DONATION_FREQUENCY_KEY
} from '~/features/campaigns/features/matched-giving/donor/composables/useMatchedGiving'
import type { DonationFrequency } from '~/features/campaigns/features/matched-giving/shared/utils/matchPeriodUtils'

withDefaults(
  defineProps<{
    editable?: boolean
  }>(),
  { editable: false }
)

// Prevent preview FormRenderers from stealing the global hash target activator
provide(HASH_TARGET_PASSIVE_KEY, true)

// Provide matched giving context so the preview shows match messaging
const matchedGiving = computed(() => store.matchedGiving)
provide(MATCHED_GIVING_KEY, matchedGiving)
const donationFrequency = computed(
  () =>
    (donationStore.activeTab === 'multiple' ? 'once' : donationStore.activeTab) as DonationFrequency
)
provide(DONATION_FREQUENCY_KEY, donationFrequency)

// Get form config from campaign store (unified source of truth)
const store = useCampaignConfigStore()
const donationStore = useDonationFormStore()

// ==================== ADMIN PREVIEW SYNC ====================
// These watchers ensure the preview updates immediately when config changes

// 1. Sync currency changes
watch(
  () => store.formConfig.donationAmounts?.baseDefaultCurrency,
  (newCurrency) => {
    if (newCurrency) {
      donationStore.setCurrency(newCurrency)
    }
  },
  { immediate: true }
)

// 2. Sync custom fields changes (cleanup orphaned + update defaults)
watch(
  () => store.formConfig.customFields,
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
  <div v-if="store.fullFormConfig" class="space-y-4">
    <PreviewEditable :enabled="editable" class="bg-muted/50 rounded-xl w-full border">
      <DonationFlowWizard :config="store.fullFormConfig" />
    </PreviewEditable>
    <DevJsonPreview :data="donationStore.completeState" />
  </div>
</template>
