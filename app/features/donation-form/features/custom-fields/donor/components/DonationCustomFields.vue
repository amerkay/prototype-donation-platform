<script setup lang="ts">
import { ref, computed } from 'vue'
import FormRenderer from '~/features/_library/form-builder/FormRenderer.vue'
import Separator from '~/components/ui/separator/Separator.vue'
import { useFormConfigStore } from '~/features/donation-form/shared/stores/formConfig'
import { useDonationFormStore } from '~/features/donation-form/donor/stores/donationForm'
import { useDonationFormContext } from '~/features/donation-form/donor/composables/useDonationFormContext'
import { checkFieldVisibility } from '~/features/_library/form-builder/composables/useFieldPath'
import {
  useCustomFieldsForm,
  extractCustomFieldDefaults
} from '~/features/_library/custom-fields/utils'
import type { FormContext } from '~/features/_library/form-builder/types'

interface Props {
  /**
   * Which custom fields tab to render (matches customFieldsTabs keys)
   * @default 'step3'
   */
  tab?: 'step2' | 'step3' | 'hidden'
  /**
   * Whether to show a separator before the custom fields section
   * @default true
   */
  showSeparator?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  tab: 'step3',
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
  const tabConfig = formConfig.value?.features.customFields.customFieldsTabs[props.tab]
  if (!tabConfig?.enabled) return null
  const fields = tabConfig.fields
  if (fields.length === 0) return null
  return useCustomFieldsForm(fields)
})

// Generate unique key for FormRenderer to force re-mount when fields change
const customFieldsKey = computed(() => {
  const tabConfig = formConfig.value?.features.customFields.customFieldsTabs[props.tab]
  if (!tabConfig?.enabled) return 'disabled'
  const fields = tabConfig.fields
  return JSON.stringify(fields)
})

// Custom fields data management
const customFieldsSection = computed({
  get: () => {
    const existingData = donationStore.formSections.customFields || {}

    // Merge defaults from ALL tabs (step2, step3, and hidden)
    // This ensures hidden fields are included in the store even if not rendered
    const allTabs = formConfig.value?.features.customFields.customFieldsTabs
    if (Object.keys(existingData).length === 0 && allTabs) {
      const defaults: Record<string, unknown> = {}

      // Merge defaults from each enabled tab
      for (const [_tabKey, tabConfig] of Object.entries(allTabs)) {
        if (tabConfig.enabled && Array.isArray(tabConfig.fields)) {
          const tabDefaults = extractCustomFieldDefaults(tabConfig.fields)
          Object.assign(defaults, tabDefaults)
        }
      }

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
  const mockContext = {
    values: computed(() => ({})),
    form: computed(() => ({}))
  } as FormContext
  const fields = Object.values(section.setup(mockContext))
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
  <!-- Hidden fields: always render but keep invisible for visibility condition evaluation -->
  <FormRenderer
    v-if="tab === 'hidden' && customFieldsFormSection"
    :key="customFieldsKey"
    ref="formRef"
    v-model="customFieldsSection"
    :validate-on-mount="false"
    :section="customFieldsFormSection"
    :context="donationContext"
    :context-schema="donationContextSchema"
    class="hidden"
    @submit="handleSubmit"
  />

  <!-- Visible fields: only render if there are visible fields -->
  <template v-else-if="hasVisibleFields && customFieldsFormSection">
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
