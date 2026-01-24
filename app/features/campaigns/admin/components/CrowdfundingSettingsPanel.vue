<script setup lang="ts">
import { useCampaignConfigStore } from '~/features/campaigns/shared/stores/campaignConfig'
import { useCampaigns } from '~/features/campaigns/shared/composables/useCampaigns'
import FormRenderer from '@/features/_library/form-builder/FormRenderer.vue'
import StickyButtonGroup from './StickyButtonGroup.vue'
import { useCrowdfundingSettingsForm } from '../forms/crowdfunding-settings-form'

const store = useCampaignConfigStore()
const { updateCampaign } = useCampaigns()

// Form definition
const crowdfundingForm = useCrowdfundingSettingsForm

// Local reactive state for form (bound to store)
const crowdfundingData = computed({
  get: () => store.crowdfunding,
  set: (val) => {
    if (val) {
      store.crowdfunding = val
      store.markDirty()
    }
  }
})

// Form refs for validation
const crowdfundingFormRef = ref()

// Save state
const saveMessage = ref<{ type: 'success' | 'error'; text: string } | null>(null)

const saveChanges = async () => {
  // Validate form
  const isValid = crowdfundingFormRef.value?.isValid

  if (!isValid) {
    saveMessage.value = { type: 'error', text: 'Please fix all errors before saving' }
    setTimeout(() => (saveMessage.value = null), 5000)
    return
  }

  if (!store.id) return

  store.isSaving = true
  saveMessage.value = null

  try {
    await updateCampaign(store.id, {
      name: store.name,
      status: store.status,
      stats: store.stats!,
      crowdfunding: store.crowdfunding!,
      peerToPeer: store.peerToPeer!,
      socialSharing: store.socialSharing!
    })

    store.markClean()
    saveMessage.value = { type: 'success', text: 'Settings saved successfully' }
    setTimeout(() => (saveMessage.value = null), 5000)
  } catch {
    saveMessage.value = { type: 'error', text: 'Failed to save settings. Please try again.' }
    setTimeout(() => (saveMessage.value = null), 5000)
  } finally {
    store.isSaving = false
  }
}

// Emit for parent to handle discard
const emit = defineEmits<{
  discard: []
}>()

const discardChanges = () => {
  emit('discard')
}
</script>

<template>
  <div class="space-y-4">
    <!-- Crowdfunding Page Settings -->
    <div v-if="crowdfundingData" class="config-section space-y-4">
      <FormRenderer
        ref="crowdfundingFormRef"
        v-model="crowdfundingData"
        :section="crowdfundingForm"
        validate-on-mount
        update-only-when-valid
      />
    </div>

    <!-- Save Button -->
    <StickyButtonGroup
      :is-dirty="store.isDirty"
      :is-saving="store.isSaving"
      :save-message="saveMessage"
      @save="saveChanges"
      @discard="discardChanges"
    />
  </div>
</template>

<style scoped>
@reference "@/assets/css/main.css";

.config-section {
  @apply px-4 py-5 sm:px-5 bg-muted/50 rounded-xl border;
}
</style>
