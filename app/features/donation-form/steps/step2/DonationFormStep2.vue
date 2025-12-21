<script setup lang="ts">
import { ref, computed, inject } from 'vue'
import type { Ref } from 'vue'
import NextButton from '~/features/donation-form/components/NextButton.vue'
import ShippingNotice from '~/features/donation-form/shipping-notice/ShippingNotice.vue'
import FormRenderer from '~/features/form-builder/FormRenderer.vue'
import { donorInfoFormSection } from './forms/donor-info-form'
import { addressFormSection } from '../../forms/address-form'
import { useDonationFormStore } from '~/stores/donationForm'
import { useImpactCartStore } from '~/stores/impactCart'
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

// Initialize Pinia stores
const store = useDonationFormStore()
const cartStore = useImpactCartStore()

// Calculate shipping item counts
const shippingCounts = computed(() => {
  let rewardCount = 0
  let cartCount = 0

  // Count rewards that require shipping for current tab
  const currentTabRewards =
    store.selectedRewards[store.activeTab as 'once' | 'monthly' | 'yearly' | 'multiple']
  if (currentTabRewards) {
    rewardCount = Array.from(currentTabRewards).filter((id) => {
      const reward = products.value.find((p: Product) => p.id === id)
      return reward?.isShippingRequired
    }).length
  }

  // Count cart items that require shipping (only for multiple tab)
  if (store.activeTab === 'multiple') {
    cartCount = cartStore.multipleCart.filter((item) => item.isShippingRequired).length
  }

  return { rewardCount, cartCount }
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
        :keep-values-on-unmount="true"
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
          :keep-values-on-unmount="true"
          @submit="handleNext"
        />
      </div>
    </template>

    <!-- Next Button -->
    <NextButton :form-refs="formRefsToValidate" @click="handleNext"> Next </NextButton>
  </div>
</template>
