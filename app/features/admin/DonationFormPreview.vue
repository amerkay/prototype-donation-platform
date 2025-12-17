<script setup lang="ts">
import { inject } from 'vue'
import type { Ref } from 'vue'
import DonationFlowWizard from '~/features/donation-form/DonationFlowWizard.vue'
import type { FormConfig } from '@/lib/common/types'

// Inject the shared form config from parent
const formConfig = inject<Ref<FormConfig>>('formConfig')

if (!formConfig) {
  throw new Error('formConfig not provided')
}
</script>

<template>
  <div class="bg-muted/50 rounded-xl w-full">
    <DonationFlowWizard :config="formConfig" />
  </div>
</template>
