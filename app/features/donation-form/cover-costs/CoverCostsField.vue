<script setup lang="ts">
import { computed, watch } from 'vue'
import FormRenderer from '~/features/form-builder/FormRenderer.vue'
import { createCoverFeesField } from './forms/cover-costs-percent-field'
import { createCoverFeesAmountField } from './forms/cover-costs-amount-field'
import { useCurrency } from '~/features/donation-form/composables/useCurrency'
import type { FormConfig } from '@/lib/common/types'
import type { ConfigSectionDef } from '~/features/form-builder/form-builder-types'

// Constants
const THRESHOLD_AMOUNT_GBP = 10 // Threshold in base currency (GBP)

interface Props {
  modelValue: Record<string, unknown>
  config: FormConfig['features']['coverCosts']
  donationAmount: number
  currency: string
}

const props = defineProps<Props>()

const emit = defineEmits<{
  'update:modelValue': [value: Record<string, unknown>]
}>()

const { convertPrice } = useCurrency('GBP')

// Convert threshold to current currency
const thresholdInCurrentCurrency = computed(() => {
  return convertPrice(THRESHOLD_AMOUNT_GBP, props.currency)
})

// Determine if we should use percentage or fixed amount mode
const usePercentageMode = computed(() => {
  return props.donationAmount >= thresholdInCurrentCurrency.value
})

// Calculate default amount for fixed mode (2x default percentage * donation amount)
const defaultFixedAmount = computed(() => {
  const calculatedAmount = (props.config.defaultPercentage / 100) * 2 * props.donationAmount
  // Cap at max value (5 in local currency)
  return Math.min(calculatedAmount, 5)
})

// Create appropriate form section based on mode
const formSection = computed<ConfigSectionDef>(() => {
  if (usePercentageMode.value) {
    // Use percentage slider for amounts >= threshold
    return {
      id: 'coverCosts',
      fields: createCoverFeesField({
        defaultValue: props.config.defaultPercentage,
        minValue: 0,
        maxValue: 30,
        heading: props.config.heading,
        description: props.config.description
      })
    }
  } else {
    // Use fixed amount slider for amounts < threshold
    return {
      id: 'coverCosts',
      fields: createCoverFeesAmountField({
        defaultValue: defaultFixedAmount.value,
        minValue: 0,
        maxValue: 5,
        heading: props.config.heading,
        description: props.config.description
      })
    }
  }
})

// Local form data model with initialization
const formData = computed({
  get: () => {
    const data = props.modelValue

    // Initialize with defaults if values are missing
    if (usePercentageMode.value) {
      if (data.coverFeesPercentage === undefined) {
        return {
          ...data,
          coverFeesPercentage: props.config.defaultPercentage
        }
      }
    } else {
      if (data.coverFeesAmount === undefined) {
        return {
          ...data,
          coverFeesAmount: defaultFixedAmount.value
        }
      }
    }

    return data
  },
  set: (value) => emit('update:modelValue', value)
})

// Watch for mode changes and clear opposite field
watch(usePercentageMode, (isPercentageMode) => {
  const currentData = { ...props.modelValue }

  if (isPercentageMode) {
    // Switching to percentage mode - clear amount, set default percentage
    if (currentData.coverFeesPercentage === undefined) {
      emit('update:modelValue', {
        ...currentData,
        coverFeesAmount: undefined,
        coverFeesPercentage: props.config.defaultPercentage
      })
    }
  } else {
    // Switching to amount mode - clear percentage, set default amount
    if (currentData.coverFeesAmount === undefined) {
      emit('update:modelValue', {
        ...currentData,
        coverFeesPercentage: undefined,
        coverFeesAmount: defaultFixedAmount.value
      })
    }
  }
})
</script>

<template>
  <FormRenderer v-model="formData" :section="formSection" :keep-values-on-unmount="true" />
</template>
