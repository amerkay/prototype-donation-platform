<script setup lang="ts">
import DonationFlowWizard from '~/features/donation-form/donor/DonationFlowWizard.vue'
import { useFormConfigStore } from '~/features/donation-form/shared/stores/formConfig'
import { useDonationFormStore } from '~/features/donation-form/donor/stores/donationForm'
import { useImpactCartStore } from '~/features/donation-form/features/impact-cart/donor/stores/impactCart'
import { useForms } from '~/features/campaigns/shared/composables/useForms'

definePageMeta({
  layout: 'donor'
})

const formConfigStore = useFormConfigStore()
const donationStore = useDonationFormStore()
const cartStore = useImpactCartStore()
const { defaultForm } = useForms('adopt-orangutan')

// Initialize form config on mount
onMounted(() => {
  if (defaultForm.value) {
    formConfigStore.initialize(defaultForm.value.config, defaultForm.value.products)
    donationStore.reset()
    cartStore.reset()
  }
})

// Watch for form availability (in case it loads async)
watch(
  () => defaultForm.value,
  (form) => {
    if (form && !formConfigStore.fullConfig) {
      formConfigStore.initialize(form.config, form.products)
      donationStore.reset()
      cartStore.reset()
    }
  }
)
</script>

<template>
  <div class="py-6 px-4 flex justify-center">
    <div class="w-full max-w-2xl">
      <DonationFlowWizard v-if="formConfigStore.fullConfig" :config="formConfigStore.fullConfig" />
    </div>
  </div>
</template>
