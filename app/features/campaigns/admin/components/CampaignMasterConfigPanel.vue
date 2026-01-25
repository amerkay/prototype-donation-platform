<script setup lang="ts">
import { useCampaignConfigStore } from '~/features/campaigns/shared/stores/campaignConfig'
import { useCampaigns } from '~/features/campaigns/shared/composables/useCampaigns'
import { useForms } from '~/features/campaigns/shared/composables/useForms'
import FormRenderer from '@/features/_library/form-builder/FormRenderer.vue'
import StickyButtonGroup from './StickyButtonGroup.vue'
import { createCampaignConfigMaster } from '../forms/campaign-config-master'

const store = useCampaignConfigStore()
const { updateCampaign } = useCampaigns()

// Get forms count for validation - will be injected as prop to formsList
const { forms } = useForms(store.id!)
const formsCount = computed(() => forms.value.length)

// Create master form with all sections as collapsible groups
const masterForm = createCampaignConfigMaster()

// Combine all store sections into one reactive object for v-model
// Component fields (formsList, fundraisersList) are nested inside their parent groups
const combinedData = computed({
  get: () => ({
    basicSettings: {
      name: store.name,
      status: store.status,
      // Inject formsCount as prop for validation (not as form data)
      formsList: { formsCount: formsCount.value }
    },
    crowdfunding: store.crowdfunding,
    peerToPeer: store.peerToPeer
      ? {
          ...store.peerToPeer,
          fundraisersList: {} // Component field - no data
        }
      : undefined,
    socialSharing: store.socialSharing
  }),
  set: (value) => {
    // Update each section independently for proper reactivity
    if (value.basicSettings) {
      const { formsList, ...basicData } = value.basicSettings
      store.name = basicData.name
      store.status = basicData.status
    }
    if (value.crowdfunding) store.crowdfunding = value.crowdfunding
    if (value.peerToPeer) {
      // Filter out component field data
      const { fundraisersList, ...peerToPeerData } = value.peerToPeer
      store.peerToPeer = peerToPeerData as typeof store.peerToPeer
    }
    if (value.socialSharing) store.socialSharing = value.socialSharing
    store.markDirty()
  }
})

// Form refs for validation
const formRef = ref()

// Save state
const saveMessage = ref<{ type: 'success' | 'error'; text: string } | null>(null)

const saveChanges = async () => {
  // Validate form
  const isValid = formRef.value?.isValid

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
    <!-- Single FormRenderer with all sections as collapsible groups + component fields -->
    <FormRenderer
      ref="formRef"
      v-model="combinedData"
      :section="masterForm"
      validate-on-mount
      update-only-when-valid
    />

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
