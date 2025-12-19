<script setup lang="ts">
import { ref, provide } from 'vue'
import DonationFormPreview from '~/features/admin/DonationFormPreview.vue'
import { formConfig as sampleConfig } from '~/features/donation-form/api-sample-response-form-config-pangea'
import { products as pangeaProducts } from '~/features/donation-form/api-sample-response-products-pangea'
import type { FormConfig, Product } from '@/lib/common/types'

// Create reactive config that both DonationFormSettings and DonationFormPreview will share
const formConfig = ref<FormConfig>(structuredClone(sampleConfig))
const products = ref<Product[]>(pangeaProducts)

// Provide config and products to all child components
provide('formConfig', formConfig)
provide('products', products)
</script>

<template>
  <div class="min-h-screen flex items-center justify-center p-4">
    <div class="w-full sm:max-w-md lg:max-w-md">
      <DonationFormPreview class="border-2" />
    </div>
  </div>
</template>
