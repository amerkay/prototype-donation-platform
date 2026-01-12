<script setup lang="ts">
import { ref, computed } from 'vue'
import NextButton from '~/features/donation-form/components/NextButton.vue'
import ShippingNotice from '~/features/donation-form/shipping-notice/ShippingNotice.vue'
import FormRenderer from '~/features/form-builder/FormRenderer.vue'
import { useDonorInfoFormSection } from '../../donor-info/forms/donor-info-form'
import { useAddressForm } from '../../forms/address-form'
import { useDonationFormStore } from '~/features/donation-form/stores/donationForm'
import { useImpactCartStore } from '~/features/donation-form/impact-cart/stores/impactCart'
import DonationCustomFields from '~/features/donation-form/custom-fields/DonationCustomFields.vue'

interface Props {
  needsShipping: boolean
}

const props = defineProps<Props>()

const emit = defineEmits<{
  complete: []
}>()

// Initialize Pinia stores
const store = useDonationFormStore()
const cartStore = useImpactCartStore()

// Calculate shipping item counts
const shippingCounts = computed(() => {
  let cartCount = 0

  // Count cart items that require shipping (only for multiple tab)
  if (store.activeTab === 'multiple') {
    cartCount = cartStore.multipleCart.filter((item) => item.isShippingRequired).length
  }

  return { cartCount }
})

// Computed refs for individual form sections
const donorInfoSection = computed({
  get: () => store.formSections.donorInfo || {},
  set: (value) => {
    store.updateFormSection('donorInfo', value ?? {})
  }
})

const shippingSection = computed({
  get: () => store.formSections.shipping || {},
  set: (value) => {
    store.updateFormSection('shipping', value ?? {})
  }
})

// Form refs
const donorFormRef = ref<InstanceType<typeof FormRenderer>>()
const shippingFormRef = ref<InstanceType<typeof FormRenderer>>()
const customFieldsRef = ref<InstanceType<typeof DonationCustomFields>>()
const formContainerRef = ref<HTMLElement | null>(null)

// Note: Address form title is set via the composable's ctx.title

// Compute form refs to validate (conditionally include shipping and custom fields)
const formRefsToValidate = computed(() => {
  const refs = [donorFormRef.value]
  if (props.needsShipping) {
    refs.push(shippingFormRef.value)
  }
  if (customFieldsRef.value?.formRef) {
    refs.push(customFieldsRef.value.formRef)
  }
  return refs.filter(Boolean)
})

// Handle next - just emit complete when valid
const handleNext = () => {
  emit('complete')
}
</script>

<template>
  <div ref="formContainerRef" class="space-y-4">
    <!-- Donor Information Form -->
    <!-- <div class="rounded-lg border border-transparent px-4 py-6 bg-background/40"> -->
    <FormRenderer
      ref="donorFormRef"
      v-model="donorInfoSection"
      :validate-on-mount="false"
      :section="useDonorInfoFormSection"
      @submit="handleNext"
    />
    <!-- </div> -->

    <!-- Shipping Address Form (conditional) -->
    <template v-if="needsShipping">
      <ShippingNotice :requires-shipping="true" :cart-count="shippingCounts.cartCount" />
      <!-- <div class="rounded-lg border border-transparent px-4 py-6 bg-background/40"> -->
      <FormRenderer
        ref="shippingFormRef"
        v-model="shippingSection"
        :validate-on-mount="false"
        :section="useAddressForm"
        @submit="handleNext"
      />
      <!-- </div> -->
    </template>

    <!-- Custom Fields (dynamically generated from admin config) -->
    <DonationCustomFields ref="customFieldsRef" tab="step2" @submit="handleNext" />

    <!-- Next Button -->
    <NextButton
      :form-refs="formRefsToValidate"
      :parent-container-ref="formContainerRef"
      @click="handleNext"
    >
      Next
    </NextButton>
  </div>
</template>
