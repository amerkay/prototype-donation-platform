<script setup lang="ts">
import { ref, computed, inject } from 'vue'
import type { Ref } from 'vue'
import NextButton from '~/features/donation-form/components/NextButton.vue'
import ShippingNotice from '~/features/donation-form/shipping-notice/ShippingNotice.vue'
import FormRenderer from '~/features/form-builder/FormRenderer.vue'
import { donorInfoFormSection } from './forms/donor-info-form'
import { addressFormSection } from '../../forms/address-form'
import { useDonationFormState } from '~/features/donation-form/composables/useDonationFormState'
import { useImpactCart } from '~/features/donation-form/composables/useImpactCart'
import type { Product } from '@/lib/common/types'

interface Props {
  needsShipping: boolean
}

const props = defineProps<Props>()

const emit = defineEmits<{
  complete: []
}>()

// Inject products from parent
const products = inject<Ref<Product[]>>('products')
if (!products) {
  throw new Error('products not provided')
}

// Pattern 6: Direct binding to form sections - no transformation layer
const { formSections, activeTab, selectedRewards } = useDonationFormState('')
const { multipleCart } = useImpactCart()

// Calculate shipping item counts
const shippingCounts = computed(() => {
  let rewardCount = 0
  let cartCount = 0

  // Count rewards that require shipping for current tab
  const currentTabRewards =
    selectedRewards.value[activeTab.value as 'once' | 'monthly' | 'yearly' | 'multiple']
  if (currentTabRewards) {
    rewardCount = Array.from(currentTabRewards).filter((id) => {
      const reward = products.value.find((p: Product) => p.id === id)
      return reward?.isShippingRequired
    }).length
  }

  // Count cart items that require shipping (only for multiple tab)
  if (activeTab.value === 'multiple') {
    cartCount = multipleCart.value.filter((item) => item.isShippingRequired).length
  }

  return { rewardCount, cartCount }
})

// Computed refs for individual form sections
const donorInfoSection = computed({
  get: () => formSections.value.donorInfo || {},
  set: (value) => {
    formSections.value.donorInfo = value ?? {}
  }
})

const shippingSection = computed({
  get: () => formSections.value.shipping || {},
  set: (value) => {
    formSections.value.shipping = value ?? {}
  }
})

// Form refs
const donorFormRef = ref<InstanceType<typeof FormRenderer>>()
const shippingFormRef = ref<InstanceType<typeof FormRenderer>>()

addressFormSection.title = 'Shipping Address'

// Compute form refs to validate (conditionally include shipping)
const formRefsToValidate = computed(() => {
  const refs = [donorFormRef.value]
  if (props.needsShipping) {
    refs.push(shippingFormRef.value)
  }
  return refs
})

// Handle next - just emit complete when valid
const handleNext = () => {
  emit('complete')
}
</script>

<template>
  <div class="space-y-4">
    <!-- Donor Information Form -->
    <div class="rounded-lg border border-transparent px-4 bg-background/40">
      <FormRenderer
        ref="donorFormRef"
        v-model="donorInfoSection"
        :section="donorInfoFormSection"
        @submit="handleNext"
      />
    </div>

    <!-- Shipping Address Form (conditional) -->
    <template v-if="needsShipping">
      <ShippingNotice
        :requires-shipping="true"
        :reward-count="shippingCounts.rewardCount"
        :cart-count="shippingCounts.cartCount"
      />
      <div class="rounded-lg border border-transparent px-4 bg-background/40">
        <FormRenderer
          ref="shippingFormRef"
          v-model="shippingSection"
          :section="addressFormSection"
          @submit="handleNext"
        />
      </div>
    </template>

    <!-- Next Button -->
    <NextButton :form-refs="formRefsToValidate" @click="handleNext"> Next </NextButton>
  </div>
</template>
