<script setup lang="ts">
import { ref, computed } from 'vue'
import { Button } from '@/components/ui/button'
import FormRenderer from '~/features/form-builder/FormRenderer.vue'
import { giftAidFormSection } from '../../forms/gift-aid-form'
import { useDonationFormState } from '~/features/donation-form/composables/useDonationFormState'

const emit = defineEmits<{
  complete: []
}>()

// Pattern 6: Direct binding - form structure IS the state structure
const { selectedCurrency, shippingSection, giftAidSection } = useDonationFormState('')

// Form renderer reference for validation
const formRef = ref<InstanceType<typeof FormRenderer> | null>(null)

/**
 * Form data with context from previous steps
 * We merge cross-section dependencies (currency, shippingAddress) into the gift aid section
 * These are read-only context fields that gift-aid-form uses for visibility/onChange logic
 */
const formDataWithContext = computed({
  get: () => {
    // Ensure homeAddress.country defaults to 'GB' for Gift Aid (UK-only requirement)
    const homeAddress = giftAidSection.value.homeAddress as Record<string, unknown> | undefined
    const homeAddressWithDefault = {
      country: 'GB', // Gift Aid is UK-only, always default to GB
      ...(homeAddress || {})
    }

    return {
      // Cross-section context (read-only)
      currency: selectedCurrency.value,
      'shippingAddress.address1': shippingSection.value.address1 as string,
      'shippingAddress.address2': shippingSection.value.address2 as string,
      'shippingAddress.city': shippingSection.value.city as string,
      'shippingAddress.countyPostcode.county': (
        shippingSection.value.countyPostcode as Record<string, unknown>
      )?.county as string,
      'shippingAddress.countyPostcode.postcode':
        ((shippingSection.value.countyPostcode as Record<string, unknown>)?.postcode as string) ||
        '',
      'shippingAddress.country': shippingSection.value.country as string,

      // Gift Aid section data (editable) - spread first to preserve all values
      // Set defaults for toggles
      joinEmailList: true, // Default to opted in
      ...giftAidSection.value,
      // Then override homeAddress with default country
      homeAddress: homeAddressWithDefault
    }
  },
  set: (value) => {
    // Extract only the gift aid fields (exclude context fields)
    const {
      currency,
      'shippingAddress.address1': _a1,
      'shippingAddress.address2': _a2,
      'shippingAddress.city': _city,
      'shippingAddress.countyPostcode.county': _county,
      'shippingAddress.countyPostcode.postcode': _postcode,
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
      <h1 class="text-lg font-bold">A few more questions&hellip;</h1>
      <!-- <p class="text-muted-foreground">Just a few more questions&hellip;</p> -->
    </div>

    <!-- Gift Aid Form -->
    <FormRenderer
      ref="formRef"
      v-model="formDataWithContext"
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
