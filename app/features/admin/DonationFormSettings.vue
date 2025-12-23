<script setup lang="ts">
import AdminDonationFormConfig from '@/features/admin/AdminDonationFormConfig.vue'

// Get shared form config from composable
const { formConfig, updateConfig } = useFormConfig()

// Handle config updates
function handleConfigUpdate(value: import('@/lib/common/types').FormConfig) {
  updateConfig(value)
}
</script>

<template>
  <AdminDonationFormConfig
    v-if="formConfig"
    :config="formConfig"
    @update:config="handleConfigUpdate"
  />
</template>
