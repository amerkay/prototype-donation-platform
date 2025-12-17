<script setup lang="ts">
import { ref, computed } from 'vue'
import { Button } from '@/components/ui/button'
import FormRenderer from '~/features/form-builder/FormRenderer.vue'
import { giftAidFormSection } from '../../forms/gift-aid-form'
import { useDonationFormState } from '~/features/donation-form/composables/useDonationFormState'

const emit = defineEmits<{
  complete: []
}>()

// Get state from composable
const { selectedCurrency, shippingAddress, giftAidData } = useDonationFormState('')

// Form renderer reference for validation
const formRef = ref<InstanceType<typeof FormRenderer> | null>(null)

// Form data with context from previous steps
const formData = computed({
  get: () => ({
    // Pass currency for Gift Aid visibility (GBP check)
    currency: selectedCurrency.value,

    // Pass shipping address fields with prefix for "use same" logic
    'shippingAddress.address1': shippingAddress.value.address1,
    'shippingAddress.address2': shippingAddress.value.address2,
    'shippingAddress.city': shippingAddress.value.city,
    'shippingAddress.countyPostcode.county': shippingAddress.value.county,
    'shippingAddress.countyPostcode.postcode': shippingAddress.value.postcode,
    'shippingAddress.country': shippingAddress.value.country,

    // Gift Aid form fields
    giftAidConsent: giftAidData.value.giftAidConsent,
    useSameAsShipping: giftAidData.value.useSameAsShipping,
    homeAddress: giftAidData.value.homeAddress,
    joinEmailList: giftAidData.value.joinEmailList,
    acceptTerms: giftAidData.value.acceptTerms
  }),
  set: (value) => {
    // Update Gift Aid data in composable state
    giftAidData.value.giftAidConsent = value.giftAidConsent ?? false
    giftAidData.value.useSameAsShipping = value.useSameAsShipping ?? false
    giftAidData.value.joinEmailList = value.joinEmailList ?? false
    giftAidData.value.acceptTerms = value.acceptTerms ?? false

    // Update home address
    if (value.homeAddress) {
      const homeAddr = value.homeAddress as typeof giftAidData.value.homeAddress
      giftAidData.value.homeAddress = homeAddr
    }
  }
})

// Handle form submission
const handleNext = () => {
  if (!formRef.value) return
  // Trigger validation
  formRef.value.onSubmit()
}

// Listen for form submit event (after validation passes)
const onFormSubmit = () => {
  emit('complete')
}

// Check if form is valid
const isFormValid = computed(() => formRef.value?.isValid ?? false)
</script>

<template>
  <div class="space-y-6">
    <!-- Step Header -->
    <div class="space-y-2">
      <h1 class="text-2xl font-bold">Complete Your Donation</h1>
      <p class="text-muted-foreground">Just a few more details to finalize your contribution</p>
    </div>

    <!-- Gift Aid Form -->
    <FormRenderer
      ref="formRef"
      v-model="formData"
      :section="giftAidFormSection"
      @submit="onFormSubmit"
    />

    <!-- Navigation Buttons -->
    <div class="flex gap-3">
      <Button size="lg" class="w-full" :disabled="!isFormValid" @click="handleNext">
        Continue to Payment
        <Icon name="lucide:arrow-right" class="ml-2 h-4 w-4" />
      </Button>
    </div>
  </div>
</template>
