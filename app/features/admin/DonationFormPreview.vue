<script setup lang="ts">
import DonationFlowWizard from '~/features/donation-form/DonationFlowWizard.vue'
import { useFormConfigStore } from '~/stores/formConfig'

// Get shared form config from store
const store = useFormConfigStore()
</script>

<template>
  <div v-if="store.fullConfig" class="bg-muted/50 rounded-xl w-full">
    <DonationFlowWizard :config="store.fullConfig" />
  </div>
</template>
