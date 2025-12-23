<script setup lang="ts">
import DonationFormPreview from '~/features/admin/DonationFormPreview.vue'
import { formConfig as sampleConfig } from '~/features/donation-form/api-sample-response-form-config'
import { products as sampleProducts } from '~/features/donation-form/api-sample-response-products'

// Initialize centralized config
const { initializeConfig } = useFormConfig()
initializeConfig(structuredClone(sampleConfig), sampleProducts)
</script>

<template>
  <div class="min-h-screen flex items-center justify-center p-4">
    <div class="w-full sm:max-w-md lg:max-w-md">
      <DonationFormPreview class="border-2" />
    </div>
  </div>
</template>
