<script setup lang="ts">
import DonationFormPreview from '~/features/admin/DonationFormPreview.vue'
import { formConfig as sampleConfig } from '~/features/donation-form/api-sample-response-form-config-pangea'
import { products as pangeaProducts } from '~/features/donation-form/api-sample-response-products-pangea'
import { useFormConfigStore } from '~/stores/formConfig'

// Initialize store with config
const store = useFormConfigStore()
store.initialize(sampleConfig, pangeaProducts)
</script>

<template>
  <div class="min-h-screen flex items-center justify-center p-4">
    <div class="w-full sm:max-w-md lg:max-w-md">
      <DonationFormPreview class="border-2" />
    </div>
  </div>
</template>
