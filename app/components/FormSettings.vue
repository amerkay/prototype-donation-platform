<script setup lang="ts">
import { inject } from 'vue'
import type { Ref } from 'vue'
import AdminDonationFormConfig from '@/components/admin/AdminDonationFormConfig.vue'
import type { FormConfig } from '@/lib/common/types'

// Inject the shared form config from parent
const formConfig = inject<Ref<FormConfig>>('formConfig')

if (!formConfig) {
  throw new Error('formConfig not provided')
}

// Handle config updates
function handleConfigUpdate(value: FormConfig) {
  if (formConfig) {
    formConfig.value = value
  }
}
</script>

<template>
  <div class="bg-muted/50 rounded-xl p-6">
    <AdminDonationFormConfig :config="formConfig" @update:config="handleConfigUpdate" />
  </div>
</template>
