<script setup lang="ts">
import { computed, onMounted, watch } from 'vue'
import FormRenderer from '~/features/form-builder/FormRenderer.vue'
import { defineForm } from '~/features/form-builder/api'
import { createCoverCostsField } from './forms/cover-costs-field'
import { useCoverCostsManager } from './composables/useCoverCostsManager'
import type { CoverCostsSettings } from './types'

interface Props {
  config: CoverCostsSettings
}

const props = defineProps<Props>()

// Use centralized cover costs manager
const {
  shouldUsePercentageMode,
  coverCostsType,
  coverCostsValue,
  setCoverCosts,
  getDefaultValue,
  donationAmount,
  currency
} = useCoverCostsManager()

// Single form section - no switching needed
const formSection = computed(() =>
  defineForm('coverCosts', () =>
    createCoverCostsField({
      heading: props.config.settings.heading,
      description: props.config.settings.description
    })
  )
)

// Form data with context
const formData = computed({
  get: () => {
    // Check if stored type matches current mode
    const storedValue = coverCostsValue.value
    const storedType = shouldUsePercentageMode.value ? 'percentage' : 'amount'
    const isTypeMismatch = coverCostsValue.value > 0 && storedType !== coverCostsType.value

    // Use default if type doesn't match mode (e.g., stored 3 as 'amount' but now in percentage mode)
    const valueToUse = isTypeMismatch
      ? getDefaultValue(props.config.settings.defaultPercentage)
      : storedValue || getDefaultValue(props.config.settings.defaultPercentage)

    return {
      donationAmount: donationAmount.value,
      currency: currency.value,
      coverCostsValue: valueToUse
    }
  },
  set: (value) => {
    if (value.coverCostsValue !== undefined) {
      setCoverCosts(value.coverCostsValue as number)
    }
  }
})

// Reset to default when mode changes
watch(shouldUsePercentageMode, (newMode, oldMode) => {
  if (oldMode !== undefined && newMode !== oldMode) {
    setCoverCosts(getDefaultValue(props.config.settings.defaultPercentage))
  }
})

// Initialize with default on mount
onMounted(() => {
  // Check for type/mode mismatch and reset if needed
  const expectedType = shouldUsePercentageMode.value ? 'percentage' : 'amount'
  const hasTypeMismatch = coverCostsType.value && coverCostsType.value !== expectedType

  if (!coverCostsValue.value || hasTypeMismatch) {
    setCoverCosts(getDefaultValue(props.config.settings.defaultPercentage))
  }
})
</script>

<template>
  <FormRenderer v-model="formData" :validate-on-mount="false" :section="formSection" />
</template>
