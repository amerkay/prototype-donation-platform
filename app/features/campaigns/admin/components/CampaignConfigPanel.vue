<script setup lang="ts">
import { useCampaignConfigStore } from '~/features/campaigns/shared/stores/campaignConfig'
import { useCampaigns } from '~/features/campaigns/shared/composables/useCampaigns'
import FormRenderer from '@/features/_library/form-builder/FormRenderer.vue'
import FormsList from './FormsList.vue'
import StickyButtonGroup from './StickyButtonGroup.vue'
import { useCampaignBasicSettingsForm } from '../forms/campaign-basic-settings-form'

const store = useCampaignConfigStore()
const { updateCampaign } = useCampaigns()

// Form definitions
const basicForm = useCampaignBasicSettingsForm

// Local reactive state for forms (bound to store)
const basicData = computed({
  get: () => ({
    name: store.name,
    status: store.status
  }),
  set: (val) => {
    store.name = val.name
    store.status = val.status
    store.markDirty()
  }
})

// Form refs for validation
const basicFormRef = ref()

// Save state
const saveMessage = ref<{ type: 'success' | 'error'; text: string } | null>(null)

const saveChanges = async () => {
  // Validate all forms
  const forms = [basicFormRef.value]

  const allValid = forms.every((form) => form?.isValid)

  if (!allValid) {
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
    <!-- Basic Settings -->
    <div class="config-section">
      <FormRenderer
        ref="basicFormRef"
        v-model="basicData"
        :section="basicForm"
        validate-on-mount
        update-only-when-valid
      />
    </div>

    <!-- Forms List -->
    <div class="config-section">
      <FormsList />
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
