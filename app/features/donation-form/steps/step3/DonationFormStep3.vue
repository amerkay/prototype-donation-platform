<script setup lang="ts">
import { ref, computed } from 'vue'
import NextButton from '~/features/donation-form/components/NextButton.vue'
import FormRenderer from '~/features/form-builder/FormRenderer.vue'
import CoverCostsField from '~/features/donation-form/cover-costs/CoverCostsField.vue'
import CoverCostsUpsellModal from '~/features/donation-form/cover-costs/CoverCostsUpsellModal.vue'
import { giftAidFormSection } from '../../gift-aid/forms/gift-aid-declaration-form'
import { createEmailOptInField } from '~/features/donation-form/contact-consent/forms/email-opt-in-field'
import { createTermsAcceptanceField } from '~/features/donation-form/terms/forms/terms-acceptance-field'
import {
  createCustomFieldsFormSection,
  extractCustomFieldDefaults
} from '~/features/donation-form/custom-fields/utils'
import { useDonationFormStore } from '~/features/donation-form/stores/donationForm'
import Separator from '~/components/ui/separator/Separator.vue'
import { useFormConfigStore } from '~/stores/formConfig'
import type { FormDef } from '~/features/form-builder/types'

// Get shared form config from store
const configStore = useFormConfigStore()
const formConfig = computed(() => configStore.fullConfig)

// Custom fields section (dynamically generated from config)
const customFieldsFormSection = computed(() => {
  if (!formConfig.value?.features.customFields.enabled) return null
  const fields = formConfig.value.features.customFields.fields
  if (fields.length === 0) return null
  return createCustomFieldsFormSection(fields)
})

// Generate unique key for FormRenderer to force re-mount when fields change
// This ensures FormRenderer picks up all field changes (not just ID changes)
const customFieldsKey = computed(() => {
  if (!formConfig.value?.features.customFields.enabled) return 'disabled'
  const fields = formConfig.value.features.customFields.fields
  // Create a stable key from field configurations
  return JSON.stringify(fields)
})

// Preferences form section (email opt-in, terms acceptance)
const preferencesFormSection: FormDef = {
  id: 'preferences',
  fields: {
    ...createEmailOptInField(),
    ...createTermsAcceptanceField()
  }
}

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
const customFieldsSection = computed({
  get: () => {
    const existingData = store.formSections.customFields || {}

    // On first load, merge default values from config
    if (Object.keys(existingData).length === 0 && formConfig.value?.features.customFields.enabled) {
      const fields = formConfig.value.features.customFields.fields
      const defaults = extractCustomFieldDefaults(fields)
      return defaults
    }

    return existingData
  },
  set: (value) => {
    store.updateFormSection('customFields', value ?? {})
  }
})
const preferencesSection = computed({
  get: () => store.formSections.preferences || {},
  set: (value) => {
    store.updateFormSection('preferences', value ?? {})
  }
})

// Form renderer references for validation
const giftAidFormRef = ref<InstanceType<typeof FormRenderer> | null>(null)
const customFieldsFormRef = ref<InstanceType<typeof FormRenderer> | null>(null)
const preferencesFormRef = ref<InstanceType<typeof FormRenderer> | null>(null)
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
 * Preferences form data (email opt-in, terms acceptance)
 * Simple pass-through with default values
 */
const preferencesDataWithContext = computed({
  get: () => {
    return {
      joinEmailList: true, // Default to opted in
      ...preferencesSection.value
    }
  },
  set: (value) => {
    preferencesSection.value = { ...preferencesSection.value, ...value }
  }
})

// Handle next - just emit complete when valid
const handleNext = () => {
  emit('complete')
}
</script>

<template>
  <div ref="formContainerRef" class="space-y-6">
    <!-- Step Header -->
    <div class="space-y-2">
      <h1 class="text-lg font-bold">A few more questions&hellip;</h1>
      <!-- <p class="text-muted-foreground">Just a few more questions&hellip;</p> -->
    </div>

    <!-- Gift Aid Form (wrapped for click delegation) -->
    <div @click="handleFormClick">
      <FormRenderer
        ref="giftAidFormRef"
        v-model="giftAidDataWithContext"
        :section="giftAidFormSection"
        :keep-values-on-unmount="true"
      />
    </div>

    <Separator v-if="formConfig?.features.coverCosts.enabled" />

    <!-- Cover Costs Field (separate component for dynamic percentage/amount switching) -->
    <div v-if="formConfig?.features.coverCosts.enabled" @click="handleFormClick">
      <CoverCostsField :config="formConfig.features.coverCosts" />
    </div>

    <Separator />

    <!-- Custom Fields (dynamically generated from admin config) -->
    <div v-if="customFieldsFormSection">
      <FormRenderer
        :key="customFieldsKey"
        ref="customFieldsFormRef"
        v-model="customFieldsSection"
        :section="customFieldsFormSection"
        :keep-values-on-unmount="true"
        @submit="handleNext"
      />
    </div>

    <Separator v-if="customFieldsFormSection" />

    <!-- Preferences Form (email opt-in, terms) -->
    <div>
      <FormRenderer
        ref="preferencesFormRef"
        v-model="preferencesDataWithContext"
        :section="preferencesFormSection"
        :keep-values-on-unmount="true"
        @submit="handleNext"
      />
    </div>

    <!-- Navigation Buttons -->
    <NextButton
      :form-refs="[giftAidFormRef, customFieldsFormRef, preferencesFormRef].filter(Boolean)"
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
