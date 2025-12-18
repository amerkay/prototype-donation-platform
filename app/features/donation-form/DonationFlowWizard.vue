<script setup lang="ts">
import { onMounted, watch, ref, nextTick } from 'vue'
import ProgressBar from '~/features/donation-form/components/ProgressBar.vue'
import OrderSummary from '~/features/donation-form/components/OrderSummary.vue'
import DonationFormStep1 from '~/features/donation-form/steps/step1/DonationFormStep1.vue'
import DonationFormStep2 from '~/features/donation-form/steps/step2/DonationFormStep2.vue'
import DonationFormStep3 from '~/features/donation-form/steps/step3/DonationFormStep3.vue'
import { useDonationFormState } from '~/features/donation-form/composables/useDonationFormState'
import { useImpactCart } from '~/features/donation-form/composables/useImpactCart'
import { products } from '~/features/donation-form/api-sample-response-products'
import type { FormConfig } from '~/lib/common/types'

interface Props {
  config?: FormConfig
}

const props = defineProps<Props>()

const TOTAL_STEPS = 4 // Donation, Donor Info, Gift Aid/Cover Fees, Payment

const {
  currentStep,
  nextStep,
  restoreFromSession,
  goToStep,
  setupSync,
  triggerSync,
  activeTab,
  selectedProducts,
  selectedRewards
} = useDonationFormState(props.config?.localization.defaultCurrency || 'USD')

const { multipleCart, restoreState } = useImpactCart()

// Centralized computed: Check if shipping is required based on current tab
const needsShipping = computed(() => {
  // Check single tab product selections
  if (activeTab.value !== 'multiple') {
    const product = selectedProducts.value[activeTab.value as 'monthly' | 'yearly']
    if (product?.isShippingRequired) return true
  }

  // Check multiple cart items
  if (multipleCart.value.some((item) => item.isShippingRequired)) return true

  // Check selected rewards for current tab
  const currentTabRewards =
    selectedRewards.value[activeTab.value as 'once' | 'monthly' | 'yearly' | 'multiple']
  return Array.from(currentTabRewards).some((id) => {
    const reward = products.find((p) => p.id === id)
    return reward?.isShippingRequired
  })
})

// Ref for the container element
const wizardContainer = ref<HTMLElement | null>(null)

// Setup sync between state and sessionStorage
setupSync(() => multipleCart.value)

// Watch multipleCart for changes and trigger immediate sync when in multiple tab
watch(
  multipleCart,
  () => {
    if (activeTab.value === 'multiple') {
      triggerSync(multipleCart.value)
    }
  },
  { deep: true }
)

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
    restoreState(restored.multipleCart)
  }
})

// Step 1 handlers
const handleStep1Complete = () => {
  nextStep()
}

// Step 2 handlers
const handleStep2Complete = () => {
  nextStep()
}

// Step 3 handlers
const handleStep3Complete = () => {
  nextStep()
  // TODO: Continue to step 4 (payment)
}

// Edit handler
const handleEdit = () => {
  goToStep(1)
}

// Back handler
const handleBack = () => {
  if (currentStep.value > 1) {
    goToStep(currentStep.value - 1)
  }
}
</script>

<template>
  <div ref="wizardContainer" class="relative w-full">
    <!-- Progress Bar -->
    <ProgressBar :current-step="currentStep" :total-steps="TOTAL_STEPS" />

    <div class="p-4 sm:p-6">
      <!-- Order Summary (shown from step 2 onwards) -->
      <OrderSummary
        v-if="currentStep >= 2"
        :needs-shipping="needsShipping"
        class="mb-4"
        @back="handleBack"
        @edit="handleEdit"
      />

      <!-- Step 1: Donation Selection -->
      <DonationFormStep1
        v-if="currentStep === 1"
        :config="config"
        @complete="handleStep1Complete"
      />

      <!-- Step 2: Donor Information & Shipping -->
      <DonationFormStep2
        v-if="currentStep === 2"
        :needs-shipping="needsShipping"
        @complete="handleStep2Complete"
      />

      <!-- Step 3: Gift Aid & Preferences -->
      <DonationFormStep3 v-if="currentStep === 3" @complete="handleStep3Complete" />

      <!-- Step 4: Payment (TODO) -->
      <div v-if="currentStep === 4" class="rounded-lg border p-8 text-center text-muted-foreground">
        <p>Step 4: Payment</p>
        <p class="mt-2 text-sm">(Coming soon)</p>
      </div>
    </div>
  </div>
</template>
