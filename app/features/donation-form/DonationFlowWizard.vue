<script setup lang="ts">
import { onMounted, watch, ref, nextTick } from 'vue'
import StepperProgress from '~/features/donation-form/common/ProgressBar.vue'
import OrderSummary from '~/features/donation-form/common/OrderSummary.vue'
import DonationFormStep1 from '~/features/donation-form/steps/step1/DonationFormStep1.vue'
import DonationFormStep2 from '~/features/donation-form/steps/step2/DonationFormStep2.vue'
import { useDonationFormState } from '~/features/donation-form/composables/useDonationFormState'
import { useImpactCart } from '~/features/donation-form/composables/useImpactCart'
import { products } from '~/features/donation-form/api-sample-response-products'
import type { FormConfig } from '~/lib/common/types'

interface Props {
  config?: FormConfig
}

const props = defineProps<Props>()

const TOTAL_STEPS = 4 // Donation, Donor Info, Gift Aid/Cover Fees, Payment

const { currentStep, nextStep, restoreFromSession, goToStep, setupSync, triggerSync, activeTab } =
  useDonationFormState(props.config?.localization.defaultCurrency || 'USD')

const { multipleCart, selectedRewards, restoreState } = useImpactCart()

// Ref for the container element
const wizardContainer = ref<HTMLElement | null>(null)

// Setup sync between state and sessionStorage
setupSync(
  () => multipleCart.value,
  () => selectedRewards.value
)

// Watch multipleCart for changes and trigger immediate sync when in multiple tab
watch(
  multipleCart,
  () => {
    if (activeTab.value === 'multiple') {
      triggerSync(multipleCart.value, selectedRewards.value)
    }
  },
  { deep: true }
)

// Watch selectedRewards for changes and trigger immediate sync
watch(selectedRewards, () => {
  triggerSync(multipleCart.value, selectedRewards.value)
})

// Scroll to top when step changes
watch(currentStep, () => {
  nextTick(() => {
    if (wizardContainer.value) {
      wizardContainer.value.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  })
})

// Restore session on mount
onMounted(() => {
  const restored = restoreFromSession()
  if (restored) {
    restoreState(restored.multipleCart, restored.selectedRewards)
  }
})

// Step 1 handlers
const handleStep1Complete = () => {
  nextStep()
}

// Step 2 handlers
const handleStep2Complete = () => {
  nextStep()
  // TODO: Continue to step 3
}

// Edit handler
const handleEdit = () => {
  goToStep(1)
}
</script>

<template>
  <div ref="wizardContainer" class="relative w-full">
    <!-- Progress Bar -->
    <StepperProgress :current-step="currentStep" :total-steps="TOTAL_STEPS" />

    <div class="p-4 sm:p-6">
      <!-- Order Summary (shown from step 2 onwards) -->
      <OrderSummary v-if="currentStep >= 2" :products="products" class="mb-4" @edit="handleEdit" />

      <!-- Step 1: Donation Selection -->
      <DonationFormStep1
        v-if="currentStep === 1"
        :config="config"
        @complete="handleStep1Complete"
      />

      <!-- Step 2: Donor Information & Shipping -->
      <DonationFormStep2
        v-if="currentStep === 2"
        :products="products"
        @complete="handleStep2Complete"
      />

      <!-- Step 3: Gift Aid / Cover Fees (TODO) -->
      <div v-if="currentStep === 3" class="rounded-lg border p-8 text-center text-muted-foreground">
        <p>Step 3: Gift Aid / Cover Our Fees</p>
        <p class="mt-2 text-sm">(Coming soon)</p>
      </div>

      <!-- Step 4: Payment (TODO) -->
      <div v-if="currentStep === 4" class="rounded-lg border p-8 text-center text-muted-foreground">
        <p>Step 4: Payment</p>
        <p class="mt-2 text-sm">(Coming soon)</p>
      </div>
    </div>
  </div>
</template>
