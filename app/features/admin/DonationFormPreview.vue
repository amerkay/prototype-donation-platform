<script setup lang="ts">
import DonationFlowWizard from '~/features/donation-form/DonationFlowWizard.vue'
import { useFormConfigStore } from '~/stores/formConfig'
import { useDonationFormStore } from '~/features/donation-form/stores/donationForm'

// Get shared form config from store
const store = useFormConfigStore()
const donationStore = useDonationFormStore()
</script>

<template>
  <div v-if="store.fullConfig" class="space-y-4">
    <div class="bg-muted/50 rounded-xl w-full">
      <DonationFlowWizard :config="store.fullConfig" />
    </div>
    <!-- <pre class="bg-muted/50 rounded-xl p-4 text-xs overflow-auto max-h-96">{{
      JSON.stringify(donationStore.$state, null, 2)
    }}</pre> -->
  </div>
</template>
