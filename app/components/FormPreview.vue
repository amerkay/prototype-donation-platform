<script setup lang="ts">
import { inject } from 'vue'
import type { Ref } from 'vue'
import DonationFormStep1 from '~/features/donation-form/DonationFormStep1.vue'
import type { FormConfig } from '@/lib/common/types'

// Inject the shared form config from parent
const formConfig = inject<Ref<FormConfig>>('formConfig')

if (!formConfig) {
  throw new Error('formConfig not provided')
}
</script>

<template>
  <div class="bg-muted/50 rounded-xl p-4 sm:p-6">
    <DonationFormStep1 :config="formConfig" />
  </div>
</template>
