<script setup lang="ts">
import { ref, computed, inject } from 'vue'
import type { Ref } from 'vue'
import NextButton from '~/features/donation-form/components/NextButton.vue'
import FormRenderer from '~/features/form-builder/FormRenderer.vue'
import CoverFeesUpsellModal from '~/features/donation-form/components/CoverFeesUpsellModal.vue'
import { createStep3FormSection } from '../../forms/step3-form'
import { useDonationFormState } from '~/features/donation-form/composables/useDonationFormState'
import { useImpactCart } from '~/features/donation-form/composables/useImpactCart'
import type { FormConfig } from '@/lib/common/types'

// Inject config from parent
const formConfig = inject<Ref<FormConfig>>('formConfig')
if (!formConfig) {
  throw new Error('formConfig not provided')
}

// Create form section dynamically with config
const step3FormSection = computed(() =>
  createStep3FormSection(formConfig.value.features.coverCosts)
)

const emit = defineEmits<{
  complete: []
}>()

// Pattern 6: Direct binding - form structure IS the state structure
const { selectedCurrency, formSections, donationAmounts, activeTab } = useDonationFormState('')
const { cartTotal } = useImpactCart()

// Computed refs for individual form sections
const shippingSection = computed(() => formSections.value.shipping || {})
const giftAidSection = computed({
  get: () => formSections.value.giftAid || {},
  set: (value) => {
    formSections.value.giftAid = value ?? {}
  }
})

// Form renderer reference for validation
const formRef = ref<InstanceType<typeof FormRenderer> | null>(null)

// Cover fees upsell modal state
const showUpsellModal = ref(false)

// Handle clicks on card buttons to open upsell modal
const handleFormClick = (event: MouseEvent) => {
  const target = event.target as HTMLElement
  if (target.hasAttribute('data-cover-fees-terms-trigger')) {
    showUpsellModal.value = true
  }
}

/**
 * Form data with context from previous steps
 * We merge cross-section dependencies (currency, shippingAddress, donationAmount) into the gift aid section
 * These are read-only context fields that gift-aid-form and cover-fees-field use for visibility/onChange logic
 */
const formDataWithContext = computed({
  get: () => {
    // Ensure homeAddress.country defaults to 'GB' for Gift Aid (UK-only requirement)
    const homeAddress = giftAidSection.value.homeAddress as Record<string, unknown> | undefined
    const homeAddressWithDefault = {
      country: 'GB', // Gift Aid is UK-only, always default to GB
      ...(homeAddress || {})
    }

    // Get current donation amount based on active tab
    const currentTab = activeTab.value
    const currentDonationAmount =
      currentTab === 'multiple' ? cartTotal(currentTab) : donationAmounts.value[currentTab] || 0

    return {
      // Cross-section context (read-only)
      currency: selectedCurrency.value,
      donationAmount: currentDonationAmount, // For cover fees calculation
      'shippingAddress.address1': shippingSection.value.address1 as string,
      'shippingAddress.address2': shippingSection.value.address2 as string,
      'shippingAddress.city': shippingSection.value.city as string,
      'shippingAddress.regionPostcode.region': (
        shippingSection.value.regionPostcode as Record<string, unknown>
      )?.region as string,
      'shippingAddress.regionPostcode.postcode':
        ((shippingSection.value.regionPostcode as Record<string, unknown>)?.postcode as string) ||
        '',
      'shippingAddress.country': shippingSection.value.country as string,

      joinEmailList: true, // Default to opted in
      coverFeesPercentage: 10, // Default to 10% for cover fees
      // Gift Aid section data (editable)
      ...giftAidSection.value,
      // Override homeAddress with default country for Gift Aid (UK-only)
      homeAddress: homeAddressWithDefault
    }
  },
  set: (value) => {
    // Extract only the gift aid fields (exclude context fields)
    const {
      currency,
      donationAmount,
      'shippingAddress.address1': _a1,
      'shippingAddress.address2': _a2,
      'shippingAddress.city': _city,
      'shippingAddress.regionPostcode.region': _region,
      'shippingAddress.regionPostcode.postcode': _postcode,
      'shippingAddress.country': _country,
      ...giftAidFields
    } = value

    // Update gift aid section - preserve existing values by merging
    giftAidSection.value = {
      ...giftAidSection.value,
      ...giftAidFields
    }
  }
})

// Handle next - just emit complete when valid
const handleNext = () => {
  emit('complete')
}
</script>

<template>
  <div class="space-y-6">
    <!-- Step Header -->
    <div class="space-y-2">
      <h1 class="text-lg font-bold">A few more questions&hellip;</h1>
      <!-- <p class="text-muted-foreground">Just a few more questions&hellip;</p> -->
    </div>

    <!-- Gift Aid Form (wrapped for click delegation) -->
    <div @click="handleFormClick">
      <FormRenderer ref="formRef" v-model="formDataWithContext" :section="step3FormSection" />
    </div>

    <!-- Navigation Buttons -->
    <NextButton :form-refs="[formRef]" @click="handleNext">
      Continue to Payment
      <Icon name="lucide:arrow-right" class="ml-2 h-4 w-4" />
    </NextButton>

    <!-- Cover Fees Upsell Modal -->
    <CoverFeesUpsellModal v-model:open="showUpsellModal" />
  </div>
</template>
