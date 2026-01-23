<script setup lang="ts">
import DonationFormPreview from '~/features/donation-form/admin/components/DonationFormPreview.vue'
import { formConfig as sampleConfig } from '~/sample-api-responses/api-sample-response-form-config'
import { products as sampleProducts } from '~/sample-api-responses/api-sample-response-products'
import {
  useFormConfigStore,
  type FullFormConfig
} from '~/features/donation-form/shared/stores/formConfig'

// Initialize store with config
const store = useFormConfigStore()
store.initialize(sampleConfig as FullFormConfig, sampleProducts)
</script>

<template>
  <div class="min-h-screen flex items-center justify-center p-4">
    <div class="w-full sm:max-w-md lg:max-w-md">
      <DonationFormPreview />
    </div>
  </div>
</template>
