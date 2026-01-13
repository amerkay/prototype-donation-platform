<script setup lang="ts">
import DonationFlowWizard from '~/features/donation-form/DonationFlowWizard.vue'
import { useFormConfigStore } from '~/stores/formConfig'
import { useDonationFormStore } from '~/features/donation-form/stores/donationForm'

// Get shared form config from store
const store = useFormConfigStore()
const donationStore = useDonationFormStore()
const isDev = import.meta.dev
</script>

<template>
  <div v-if="store.fullConfig" class="space-y-4">
    <div class="bg-muted/50 rounded-xl w-full border">
      <DonationFlowWizard :config="store.fullConfig" />
    </div>
    <pre v-if="isDev" class="bg-muted/50 rounded-xl p-4 text-xs overflow-auto max-h-96 border">{{
      JSON.stringify(donationStore.completeState, null, 2)
    }}</pre>
  </div>
</template>
