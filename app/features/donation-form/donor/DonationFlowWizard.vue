<script setup lang="ts">
import { watch, ref, nextTick } from 'vue'
import ProgressBar from '~/features/donation-form/donor/components/ProgressBar.vue'
import OrderSummary from '~/features/donation-form/donor/components/OrderSummary.vue'
import DonationFormStep1 from '~/features/donation-form/donor/steps/step1/DonationFormStep1.vue'
import DonationFormStep2 from '~/features/donation-form/donor/steps/step2/DonationFormStep2.vue'
import DonationFormStep3 from '~/features/donation-form/donor/steps/step3/DonationFormStep3.vue'
import DonationCustomFields from '~/features/donation-form/features/custom-fields/donor/components/DonationCustomFields.vue'
import { useDonationFormStore } from '~/features/donation-form/donor/stores/donationForm'
import { useImpactCartStore } from '~/features/donation-form/features/impact-cart/donor/stores/impactCart'
import type { FullFormConfig } from '~/features/donation-form/shared/stores/formConfig'
import { formConfig as defaultConfig } from '~/sample-api-responses/api-sample-response-form-config'

const props = defineProps<{
  config?: FullFormConfig
}>()

// Use provided config or fall back to default
const activeConfig = computed(() => props.config ?? defaultConfig)

const TOTAL_STEPS = 4 // Donation, Donor Info, Gift Aid/Cover Fees, Payment

// Initialize Pinia stores
const store = useDonationFormStore()
store.initialize(activeConfig.value.pricing.baseDefaultCurrency)

const cartStore = useImpactCartStore()

// Sync impactCart multipleCart to donationForm store for persistence
watch(
  () => cartStore.multipleCart,
  (cart) => {
    store.syncMultipleCart(cart)
  },
  { deep: true, immediate: true }
)

// Restore impactCart from donationForm on mount
if (store.multipleCart.length > 0) {
  cartStore.restoreState(store.multipleCart)
}

// Ref for the container element
const wizardContainer = ref<HTMLElement | null>(null)

// Scroll to top when step changes
watch(
  () => store.currentStep,
  () => {
    nextTick(() => {
      if (!wizardContainer.value) return

      // Find the scroll container (for desktop sticky preview)
      const scrollContainer = wizardContainer.value.closest(
        '.overflow-y-auto'
      ) as HTMLElement | null

      if (scrollContainer) {
        // Scroll within the container (desktop preview)
        scrollContainer.scrollTo({ top: 0, behavior: 'smooth' })
      } else {
        // Scroll the window (mobile or full page)
        wizardContainer.value.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }
    })
  }
)

// Step 1 handlers
const handleStep1Complete = () => {
  store.nextStep()
}

// Step 2 handlers
const handleStep2Complete = () => {
  store.nextStep()
}

// Step 3 handlers
const handleStep3Complete = () => {
  store.nextStep()
  // TODO: Continue to step 4 (payment)
}

// Edit handler
const handleEdit = () => {
  store.goToStep(1)
}

// Back handler
const handleBack = () => {
  store.previousStep()
}
</script>

<template>
  <div ref="wizardContainer" class="relative w-full">
    <!-- Hidden custom fields: Always mounted for visibility condition evaluation -->
    <DonationCustomFields tab="hidden" :show-separator="false" />

    <!-- Progress Bar -->
    <ProgressBar :current-step="store.currentStep" :total-steps="TOTAL_STEPS" />

    <div class="p-4 sm:p-6">
      <!-- Order Summary (shown from step 2 onwards) -->
      <OrderSummary
        v-if="store.currentStep >= 2"
        :needs-shipping="store.needsShipping"
        class="mb-4"
        @back="handleBack"
        @edit="handleEdit"
      />

      <!-- Step 1: Donation Selection -->
      <DonationFormStep1
        v-if="store.currentStep === 1"
        :config="config"
        @complete="handleStep1Complete"
      />

      <!-- Step 2: Donor Information & Shipping -->
      <DonationFormStep2
        v-if="store.currentStep === 2"
        :needs-shipping="store.needsShipping"
        @complete="handleStep2Complete"
      />

      <!-- Step 3: Gift Aid & Preferences -->
      <DonationFormStep3 v-if="store.currentStep === 3" @complete="handleStep3Complete" />

      <!-- Step 4: Payment (TODO) -->
      <div
        v-if="store.currentStep === 4"
        class="rounded-lg border p-8 text-center text-muted-foreground"
      >
        <p>Step 4: Total &amp; Payment</p>
        <p class="mt-2 text-sm">(Coming soon)</p>
      </div>
    </div>
  </div>
</template>
