<script setup lang="ts">
import { ref, computed } from 'vue'
import NextButton from '~/features/donation-form/components/NextButton.vue'
import FormRenderer from '~/features/form-builder/FormRenderer.vue'
import { donorInfoFormSection } from './forms/donor-info-form'
import { addressFormSection } from '../../forms/address-form'
import { useDonationFormState } from '~/features/donation-form/composables/useDonationFormState'
import { useImpactCart } from '~/features/donation-form/composables/useImpactCart'
import type { Product } from '~/lib/common/types'

interface Props {
  needsShipping: boolean
}

const props = defineProps<Props>()

const emit = defineEmits<{
  complete: []
}>()

// Pattern 6: Direct binding to form sections - no transformation layer
const { donorInfoSection, shippingSection } = useDonationFormState('')

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
    <div v-if="needsShipping" class="rounded-lg border border-transparent px-4 bg-background/40">
      <FormRenderer
        ref="shippingFormRef"
        v-model="shippingSection"
        :section="addressFormSection"
        @submit="handleNext"
      />
    </div>

    <!-- Next Button -->
    <NextButton :form-refs="formRefsToValidate" @click="handleNext">
      Continue to Payment
    </NextButton>
  </div>
</template>
