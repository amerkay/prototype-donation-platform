<script setup lang="ts">
import { ref, computed } from 'vue'
import { Button } from '~/components/ui/button'
import FormRenderer from '~/features/form-builder/FormRenderer.vue'
import OrderSummary from '~/features/donation-form/common/OrderSummary.vue'
import { donorInfoFormSection } from './form-builder/donor-info-form'
import { shippingAddressFormSection } from './form-builder/shipping-address-form'
import { useDonationFormState } from '~/features/donation-form/composables/useDonationFormState'
import { useImpactCart } from '~/features/donation-form/composables/useImpactCart'
import type { Product } from '~/lib/common/types'

interface Props {
  products: Product[]
}

const props = defineProps<Props>()

const emit = defineEmits<{
  complete: []
  edit: []
}>()

const { donorInfo, shippingAddress, activeTab, selectedProducts } = useDonationFormState('')
const { multipleCart, selectedRewards } = useImpactCart()

// Form refs
const donorFormRef = ref<InstanceType<typeof FormRenderer>>()
const shippingFormRef = ref<InstanceType<typeof FormRenderer>>()

// Check if shipping is needed
const needsShipping = computed(() => {
  // Check single tab selections
  if (activeTab.value !== 'multiple') {
    const product = selectedProducts.value[activeTab.value as 'monthly' | 'yearly']
    if (product?.isShippingRequired) return true
  }

  // Check multiple cart
  const hasShippingItem = multipleCart.value.some((item) => item.isShippingRequired)
  if (hasShippingItem) return true

  // Check rewards
  return Array.from(selectedRewards.value).some((id) => {
    const reward = props.products.find((p) => p.id === id)
    return reward?.isShippingRequired
  })
})

// Form values (nested structure for form-builder)
const donorFormValues = computed({
  get: () => ({
    name: {
      firstName: donorInfo.value.firstName,
      lastName: donorInfo.value.lastName
    },
    email: donorInfo.value.email,
    phone: donorInfo.value.phone
  }),
  set: (value) => {
    donorInfo.value.firstName = value.name?.firstName || ''
    donorInfo.value.lastName = value.name?.lastName || ''
    donorInfo.value.email = value.email || ''
    donorInfo.value.phone = value.phone || ''
  }
})

const shippingFormValues = computed({
  get: () => ({
    address1: shippingAddress.value.address1,
    address2: shippingAddress.value.address2,
    cityStatePostal: {
      city: shippingAddress.value.city,
      state: shippingAddress.value.state
    },
    postalCountry: {
      postalCode: shippingAddress.value.postalCode,
      country: shippingAddress.value.country
    }
  }),
  set: (value) => {
    shippingAddress.value.address1 = value.address1 || ''
    shippingAddress.value.address2 = value.address2 || ''
    shippingAddress.value.city = value.cityStatePostal?.city || ''
    shippingAddress.value.state = value.cityStatePostal?.state || ''
    shippingAddress.value.postalCode = value.postalCountry?.postalCode || ''
    shippingAddress.value.country = value.postalCountry?.country || ''
  }
})

// Validate and proceed
const handleNext = async () => {
  // Validate donor form
  const donorValid = donorFormRef.value?.isValid
  if (!donorValid) {
    // Trigger validation by attempting submit
    donorFormRef.value?.onSubmit()
    return
  }

  // Validate shipping form if needed
  if (needsShipping.value) {
    const shippingValid = shippingFormRef.value?.isValid
    if (!shippingValid) {
      shippingFormRef.value?.onSubmit()
      return
    }
  }

  // All valid - emit complete
  emit('complete')
}
</script>

<template>
  <div class="space-y-4">
    <!-- Order Summary -->
    <OrderSummary :products="products" @edit="emit('edit')" />

    <!-- Donor Information Form -->
    <div class="rounded-lg border px-4 bg-background/80">
      <FormRenderer
        ref="donorFormRef"
        v-model="donorFormValues"
        :section="donorInfoFormSection"
        @submit="handleNext"
      />
    </div>

    <!-- Shipping Address Form (conditional) -->
    <div v-if="needsShipping" class="rounded-lg border px-4 bg-background/80">
      <FormRenderer
        ref="shippingFormRef"
        v-model="shippingFormValues"
        :section="shippingAddressFormSection"
        @submit="handleNext"
      />
    </div>

    <!-- Next Button -->
    <Button class="w-full" size="lg" @click="handleNext"> Continue to Payment </Button>
  </div>
</template>
