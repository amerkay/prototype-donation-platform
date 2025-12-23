<script setup lang="ts">
import { computed, onMounted } from 'vue'
import FormRenderer from '~/features/form-builder/FormRenderer.vue'
import { createCoverFeesField } from './forms/cover-costs-percent-field'
import { createCoverFeesAmountField } from './forms/cover-costs-amount-field'
import { useCoverCostsManager } from './composables/useCoverCostsManager'
import type { FormConfig } from '@/lib/common/types'
import type { FormDef } from '~/features/form-builder/form-builder-types'

interface Props {
  config: FormConfig['features']['coverCosts']
}

const props = defineProps<Props>()

// Use centralized cover costs manager
const {
  shouldUsePercentageMode,
  coverCostsType,
  coverCostsValue,
  setCoverCostsPercentage,
  setCoverCostsAmount,
  donationAmount,
  currency
} = useCoverCostsManager()

// Calculate default amount for fixed mode (2x default percentage * donation amount)
const defaultFixedAmount = computed(() => {
  const calculatedAmount = (props.config.defaultPercentage / 100) * 2 * donationAmount.value
  // Cap at max value (5 in local currency)
  return Math.min(calculatedAmount, 5)
})

// Create appropriate form section based on mode
const formSection = computed<FormDef>(() => {
  if (shouldUsePercentageMode.value) {
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
    // Build data object with context needed for field descriptions
    const data: Record<string, unknown> = {
      donationAmount: donationAmount.value,
      currency: currency.value
    }

    if (shouldUsePercentageMode.value) {
      if (coverCostsType.value === 'percentage') {
        data.coverFeesPercentage = coverCostsValue.value
      } else {
        // Initialize with default if not set or switching from amount mode
        data.coverFeesPercentage = props.config.defaultPercentage
      }
    } else {
      if (coverCostsType.value === 'amount') {
        data.coverFeesAmount = coverCostsValue.value
      } else {
        // Initialize with default if not set or switching from percentage mode
        data.coverFeesAmount = defaultFixedAmount.value
      }
    }

    return data
  },
  set: (value) => {
    // Update store based on which field changed
    if (value.coverFeesPercentage !== undefined) {
      setCoverCostsPercentage(value.coverFeesPercentage as number)
    } else if (value.coverFeesAmount !== undefined) {
      setCoverCostsAmount(value.coverFeesAmount as number)
    }
  }
})

// Initialize correct field on mount based on current mode
onMounted(() => {
  if (shouldUsePercentageMode.value) {
    // In percentage mode - ensure percentage field exists
    if (coverCostsType.value !== 'percentage') {
      setCoverCostsPercentage(props.config.defaultPercentage)
    }
  } else {
    // In amount mode - ensure amount field exists
    if (coverCostsType.value !== 'amount') {
      setCoverCostsAmount(defaultFixedAmount.value)
    }
  }
})
</script>

<template>
  <FormRenderer v-model="formData" :section="formSection" :keep-values-on-unmount="true" />
</template>
