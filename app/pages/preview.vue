<script setup lang="ts">
import { ref, provide } from 'vue'
import DonationFormPreview from '~/features/admin/DonationFormPreview.vue'
import { formConfig as sampleConfig } from '~/features/donation-form/api-sample-response-form-config'
import type { FormConfig } from '@/lib/common/types'

// Create reactive config that both DonationFormSettings and DonationFormPreview will share
const formConfig = ref<FormConfig>(structuredClone(sampleConfig))

// Provide config to all child components
provide('formConfig', formConfig)
</script>

<template>
  <div class="w-full sm:mx-auto lg:min-w-md lg:max-w-md lg:w-md sm:mt-4">
    <DonationFormPreview class="border-2" />
  </div>
</template>
