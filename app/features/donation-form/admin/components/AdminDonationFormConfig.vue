<script setup lang="ts">
import FormRenderer from '@/features/_library/form-builder/FormRenderer.vue'
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
const combinedData = computed({
  get: () => ({
    formSettings: store.formSettings,
    impactCart: store.impactCart,
    productSelector: store.productSelector,
    impactJourney: store.impactJourney,
    coverCosts: store.coverCosts,
    giftAid: store.giftAid,
    tribute: store.tribute,
    customFields: store.customFields
  }),
  set: (value) => {
    // Update each section independently for proper reactivity
    if (value.formSettings) store.formSettings = value.formSettings
    if (value.impactCart) store.impactCart = value.impactCart
    if (value.productSelector) store.productSelector = value.productSelector
    if (value.impactJourney) store.impactJourney = value.impactJourney
    if (value.coverCosts) store.coverCosts = value.coverCosts
    if (value.giftAid) store.giftAid = value.giftAid
    if (value.tribute) store.tribute = value.tribute
    if (value.customFields) store.customFields = value.customFields
  }
})
</script>

<template>
  <div class="w-full mx-auto space-y-6">
    <!-- Single FormRenderer with all sections as collapsible groups -->
    <FormRenderer
      v-model="combinedData"
      :section="masterForm"
      :context-schema="donationContextSchema"
      update-only-when-valid
    />
  </div>
</template>
