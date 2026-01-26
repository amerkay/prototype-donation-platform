<script setup lang="ts">
import FormRenderer from '@/features/_library/form-builder/FormRenderer.vue'
import StickyButtonGroup from '~/features/campaigns/admin/components/StickyButtonGroup.vue'
import { createAdminDonationFormMaster } from '~/features/donation-form/admin/forms/admin-donation-form-master'
import { useFormConfigStore } from '~/features/donation-form/shared/stores/formConfig'
import { useDonationFormContext } from '~/features/donation-form/donor/composables/useDonationFormContext'

// Get shared reactive config store - mutations propagate automatically
const store = useFormConfigStore()

// Get donation form context for custom fields
const { contextSchema: donationContextSchema } = useDonationFormContext()

// Create master form with all sections as collapsible groups
const masterForm = createAdminDonationFormMaster(donationContextSchema)

// Combine all store sections into one reactive object for v-model
// Features are now grouped under "features" fieldGroup
const combinedData = computed({
  get: () => ({
    formSettings: store.formSettings,
    features: {
      impactJourney: store.impactJourney,
      impactCart: store.impactCart,
      productSelector: store.productSelector,
      coverCosts: store.coverCosts,
      giftAid: store.giftAid,
      tribute: store.tribute
    },
    customFields: store.customFields
  }),
  set: (value) => {
    // Update each section independently for proper reactivity
    if (value.formSettings) store.formSettings = value.formSettings

    // Extract individual feature sections from the features group
    if (value.features) {
      const features = value.features as Record<string, unknown>
      if (features.impactJourney)
        store.impactJourney = features.impactJourney as typeof store.impactJourney
      if (features.impactCart) store.impactCart = features.impactCart as typeof store.impactCart
      if (features.productSelector)
        store.productSelector = features.productSelector as typeof store.productSelector
      if (features.coverCosts) store.coverCosts = features.coverCosts as typeof store.coverCosts
      if (features.giftAid) store.giftAid = features.giftAid as typeof store.giftAid
      if (features.tribute) store.tribute = features.tribute as typeof store.tribute
    }

    if (value.customFields) store.customFields = value.customFields
    store.markDirty()
  }
})

// Emit for parent to handle save/discard
const emit = defineEmits<{
  save: []
  discard: []
}>()

// Form ref for validation
const formRef = ref()

// Expose validation state to parent
defineExpose({
  isValid: computed(() => formRef.value?.isValid ?? false)
})
</script>

<template>
  <div class="w-full mx-auto space-y-6">
    <!-- Single FormRenderer with all sections as collapsible groups -->
    <FormRenderer
      ref="formRef"
      v-model="combinedData"
      :section="masterForm"
      :context-schema="donationContextSchema"
      validate-on-mount
      update-only-when-valid
    />

    <!-- Save/Discard Buttons -->
    <StickyButtonGroup
      :is-dirty="store.isDirty"
      :is-saving="store.isSaving"
      @save="emit('save')"
      @discard="emit('discard')"
    />
  </div>
</template>
