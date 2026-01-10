<script setup lang="ts">
import { ref, computed } from 'vue'
import FormRenderer from '~/features/form-builder/FormRenderer.vue'
import Separator from '~/components/ui/separator/Separator.vue'
import { useFormConfigStore } from '~/stores/formConfig'
import { useDonationFormStore } from '~/features/donation-form/stores/donationForm'
import { useDonationFormContext } from '~/features/donation-form/composables/useDonationFormContext'
import { checkFieldVisibility } from '~/features/form-builder/composables/useFieldPath'
import {
  createCustomFieldsFormSection,
  extractCustomFieldDefaults
} from '~/features/custom-fields/utils'

interface Props {
  /**
   * Which step's custom fields to render
   * @default 'step3'
   */
  step?: 'step2' | 'step3'
  /**
   * Whether to show a separator before the custom fields section
   * @default true
   */
  showSeparator?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  step: 'step3',
  showSeparator: true
})

const emit = defineEmits<{
  submit: []
}>()

// Get stores
const configStore = useFormConfigStore()
const donationStore = useDonationFormStore()

// Get form config
const formConfig = computed(() => configStore.fullConfig)

// Get donation form context for custom fields
const { context: donationContext, contextSchema: donationContextSchema } = useDonationFormContext()

// Custom fields section (dynamically generated from config)
const customFieldsFormSection = computed(() => {
  const stepConfig = formConfig.value?.features.customFields.customFieldsTabs[props.step]
  if (!stepConfig?.enabled) return null
  const fields = stepConfig.fields
  if (fields.length === 0) return null
  return createCustomFieldsFormSection(fields)
})

// Generate unique key for FormRenderer to force re-mount when fields change
const customFieldsKey = computed(() => {
  const stepConfig = formConfig.value?.features.customFields.customFieldsTabs[props.step]
  if (!stepConfig?.enabled) return 'disabled'
  const fields = stepConfig.fields
  return JSON.stringify(fields)
})

// Custom fields data management
const customFieldsSection = computed({
  get: () => {
    const existingData = donationStore.formSections.customFields || {}

    // On first load, merge default values from config
    const stepConfig = formConfig.value?.features.customFields.customFieldsTabs?.[props.step]
    if (Object.keys(existingData).length === 0 && stepConfig?.enabled) {
      const fields = stepConfig.fields
      const defaults = extractCustomFieldDefaults(fields)
      return defaults
    }

    return existingData
  },
  set: (value) => {
    donationStore.updateFormSection('customFields', value ?? {})
  }
})

// Check if there are any visible custom fields
// This considers both field existence and visibility conditions
const hasVisibleFields = computed(() => {
  if (!customFieldsFormSection.value) return false

  const section = customFieldsFormSection.value
  const fields = Object.values(section.fields)
  if (fields.length === 0) return false

  // Create field context for visibility checks
  // Use donation context as primary source (for conditions like currency, amount, etc.)
  // Merge with custom field values (for conditions that reference other custom fields)
  const fieldContext = {
    values: { ...donationContext.value, ...customFieldsSection.value },
    root: {}
  }

  // Check if at least one field is visible
  return fields.some((fieldMeta) =>
    checkFieldVisibility(fieldMeta, fieldContext, { skipContainerValidation: true })
  )
})

// Form renderer reference for validation
const formRef = ref<InstanceType<typeof FormRenderer>>()

// Handle submit from FormRenderer
const handleSubmit = () => {
  emit('submit')
}

// Expose validation methods and ref for parent components
defineExpose({
  formRef,
  isValid: computed(() => formRef.value?.isValid ?? false)
})
</script>

<template>
  <template v-if="hasVisibleFields && customFieldsFormSection">
    <Separator v-if="showSeparator" />
    <!-- <div class="rounded-lg border border-transparent px-4 py-6 bg-background/40"> -->
    <FormRenderer
      :key="customFieldsKey"
      ref="formRef"
      v-model="customFieldsSection"
      :validate-on-mount="false"
      :section="customFieldsFormSection"
      :context="donationContext"
      :context-schema="donationContextSchema"
      @submit="handleSubmit"
    />
    <!-- </div> -->
  </template>
</template>
