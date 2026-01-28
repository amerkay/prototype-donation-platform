<script setup lang="ts">
import { ref, computed } from 'vue'
import NextButton from '~/features/donation-form/donor/components/NextButton.vue'
import FormRenderer from '~/features/_library/form-builder/FormRenderer.vue'
import CoverCostsField from '~/features/donation-form/features/cover-costs/donor/components/CoverCostsField.vue'
import CoverCostsUpsellModal from '~/features/donation-form/features/cover-costs/donor/components/CoverCostsUpsellModal.vue'
import { defineForm } from '~/features/_library/form-builder/api'
import { createGiftAidFields } from '~/features/donation-form/features/gift-aid/donor/forms/gift-aid-declaration-form'
import { createEmailOptInField } from '~/features/donation-form/features/contact-consent/donor/forms/email-opt-in-field'
import { createTermsAcceptanceField } from '~/features/donation-form/features/terms/donor/forms/terms-acceptance-field'
import { useDonationFormStore } from '~/features/donation-form/donor/stores/donationForm'
import Separator from '~/components/ui/separator/Separator.vue'
import { useFormConfigStore } from '~/features/donation-form/shared/stores/formConfig'
import DonationCustomFields from '~/features/donation-form/features/custom-fields/donor/components/DonationCustomFields.vue'
import type { FieldDef } from '~/features/_library/form-builder/types'

// Get shared form config from store
const configStore = useFormConfigStore()
const formConfig = computed(() => configStore.fullConfig)

// Gift Aid form section (dynamically enabled from config)
const giftAidFormSection = computed(() =>
  defineForm(
    'gift-aid',
    () =>
      createGiftAidFields(formConfig.value?.features.giftAid.enabled ?? true) as Record<
        string,
        FieldDef
      >
  )
)

// Email opt-in form section
const emailOptInFormSection = defineForm('email-opt-in', () => createEmailOptInField())

// Terms acceptance form section (should be last)
const termsFormSection = defineForm('terms', () => createTermsAcceptanceField())

const emit = defineEmits<{
  complete: []
}>()

// Initialize Pinia store
const store = useDonationFormStore()

// Computed refs for individual form sections
const shippingSection = computed(() => store.formSections.shipping || {})
const giftAidSection = computed({
  get: () => store.formSections.giftAid || {},
  set: (value) => {
    store.updateFormSection('giftAid', value ?? {})
  }
})
const emailOptInSection = computed({
  get: () => store.formSections.emailOptIn || {},
  set: (value) => {
    store.updateFormSection('emailOptIn', value ?? {})
  }
})
const termsSection = computed({
  get: () => store.formSections.terms || {},
  set: (value) => {
    store.updateFormSection('terms', value ?? {})
  }
})

// Form renderer references for validation
const giftAidFormRef = ref<InstanceType<typeof FormRenderer> | null>(null)
const emailOptInFormRef = ref<InstanceType<typeof FormRenderer> | null>(null)
const termsFormRef = ref<InstanceType<typeof FormRenderer> | null>(null)
const customFieldsRef = ref<InstanceType<typeof DonationCustomFields> | null>(null)
const formContainerRef = ref<HTMLElement | null>(null)

// Cover costs upsell modal state
const showUpsellModal = ref(false)

// Handle clicks on card buttons to open upsell modal
const handleFormClick = (event: MouseEvent) => {
  const target = event.target as HTMLElement
  if (target.hasAttribute('data-cover-costs-terms-trigger')) {
    showUpsellModal.value = true
  }
}

/**
 * Gift Aid form data with context from previous steps
 * We merge cross-section dependencies (currency, shippingAddress) for visibility logic and address reuse
 */
const giftAidDataWithContext = computed({
  get: () => {
    // Ensure homeAddress.country defaults to 'GB' for Gift Aid (UK-only requirement)
    const homeAddress = giftAidSection.value.homeAddress as Record<string, unknown> | undefined
    const homeAddressWithDefault = {
      country: 'GB', // Gift Aid is UK-only, always default to GB
      ...(homeAddress || {})
    }

    return {
      // Cross-section context (read-only)
      currency: store.selectedCurrency,
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

/**
 * Email opt-in form data with default value
 */
const emailOptInDataWithContext = computed({
  get: () => {
    return {
      joinEmailList: true, // Default to opted in
      ...emailOptInSection.value
    }
  },
  set: (value) => {
    emailOptInSection.value = { ...emailOptInSection.value, ...value }
  }
})

/**
 * Terms acceptance form data
 */
const termsDataWithContext = computed({
  get: () => {
    return {
      ...termsSection.value
    }
  },
  set: (value) => {
    termsSection.value = { ...termsSection.value, ...value }
  }
})

// Handle next - just emit complete when valid
const handleNext = () => {
  emit('complete')
}
</script>

<template>
  <div ref="formContainerRef" class="space-y-6">
    <!-- Cover Costs Field (separate component for dynamic percentage/amount switching) -->
    <div v-if="formConfig?.features.coverCosts.enabled" @click="handleFormClick">
      <CoverCostsField :config="formConfig.features.coverCosts" />
    </div>

    <Separator v-if="formConfig?.features.coverCosts.enabled" />

    <!-- Gift Aid Form (wrapped for click delegation) -->
    <div v-if="formConfig?.features.giftAid.enabled" @click="handleFormClick">
      <FormRenderer
        ref="giftAidFormRef"
        v-model="giftAidDataWithContext"
        :validate-on-mount="false"
        :section="giftAidFormSection"
      />
    </div>

    <Separator v-if="formConfig?.features.giftAid.enabled" />

    <!-- Custom Fields (dynamically generated from admin config) -->
    <DonationCustomFields ref="customFieldsRef" tab="step3" @submit="handleNext" />

    <!-- Email Opt-in -->
    <div>
      <FormRenderer
        ref="emailOptInFormRef"
        v-model="emailOptInDataWithContext"
        :validate-on-mount="false"
        :section="emailOptInFormSection"
      />
    </div>

    <!-- Terms Acceptance (last item before navigation) -->
    <div>
      <FormRenderer
        ref="termsFormRef"
        v-model="termsDataWithContext"
        :validate-on-mount="false"
        :section="termsFormSection"
        @submit="handleNext"
      />
    </div>

    <!-- Navigation Buttons -->
    <NextButton
      :form-refs="
        [giftAidFormRef, emailOptInFormRef, customFieldsRef?.formRef, termsFormRef].filter(Boolean)
      "
      :parent-container-ref="formContainerRef"
      @click="handleNext"
    >
      Continue to Payment
      <Icon name="lucide:arrow-right" class="ml-2 h-4 w-4" />
    </NextButton>

    <!-- Cover Fees Upsell Modal -->
    <CoverCostsUpsellModal v-model:open="showUpsellModal" />
  </div>
</template>
