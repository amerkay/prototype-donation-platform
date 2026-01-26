<script setup lang="ts">
import { useCampaignConfigStore } from '~/features/campaigns/shared/stores/campaignConfig'
import { useForms } from '~/features/campaigns/shared/composables/useForms'
import FormRenderer from '@/features/_library/form-builder/FormRenderer.vue'
import StickyButtonGroup from './StickyButtonGroup.vue'
import { createCampaignConfigMaster } from '../forms/campaign-config-master'

const store = useCampaignConfigStore()

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

// Emit for parent to handle save/discard
const emit = defineEmits<{
  save: []
  discard: []
}>()

// Expose validation state to parent
defineExpose({
  isValid: computed(() => formRef.value?.isValid ?? false)
})
</script>

<template>
  <div class="space-y-4">
    <!-- Form Renderer -->
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
      @save="emit('save')"
      @discard="emit('discard')"
    />
  </div>
</template>
