<script setup lang="ts">
import DonationFlowWizard from '~/features/donation-form/DonationFlowWizard.vue'

// Get shared form config from composable
const { formConfig } = useFormConfig()
</script>

<template>
  <div v-if="formConfig" class="bg-muted/50 rounded-xl w-full">
    <DonationFlowWizard :config="formConfig" />
  </div>
</template>
