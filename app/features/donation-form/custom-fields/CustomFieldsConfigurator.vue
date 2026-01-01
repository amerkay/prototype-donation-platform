<script setup lang="ts">
import { ref, watch } from 'vue'
import { createCustomFieldsConfigSection } from './forms/custom-fields-config-form'
import FormRenderer from '~/features/form-builder/FormRenderer.vue'
import type { CustomFieldsSettings, CustomFieldDefinition } from './types'

interface Props {
  modelValue: CustomFieldsSettings
}

const props = defineProps<Props>()
const emit = defineEmits<{
  'update:modelValue': [value: CustomFieldsSettings]
  submit: []
}>()

// Internal data with helper fields for UI
const internalData = ref<CustomFieldsSettings>(props.modelValue)

// Initialize helper fields from defaultValue when loading data
watch(
  () => props.modelValue,
  (newValue) => {
    if (!newValue.fields) {
      internalData.value = newValue
      return
    }

    // Hydrate helper fields from defaultValue
    const hydratedFields = newValue.fields.map((field) => {
      if (!field.fieldConfig) return field

      // Use Record to allow dynamic properties
      const hydrated = {
        ...field,
        fieldConfig: { ...field.fieldConfig } as Record<string, unknown>
      }

      // For slider: populate sliderDefault from defaultValue
      if (field.type === 'slider' && field.fieldConfig.defaultValue !== undefined) {
        hydrated.fieldConfig.sliderDefault = field.fieldConfig.defaultValue
      }

      // For select: populate selectDefault from defaultValue
      if (field.type === 'select' && field.fieldConfig.defaultValue !== undefined) {
        hydrated.fieldConfig.selectDefault = field.fieldConfig.defaultValue
      }

      return hydrated
    })

    internalData.value = {
      ...newValue,
      fields: hydratedFields as CustomFieldDefinition[]
    }
  },
  { immediate: true, deep: true }
)

// Clean helper fields before emitting
function cleanFieldConfig(config: Record<string, unknown>): Record<string, unknown> {
  const cleaned = { ...config }
  delete cleaned.sliderDefault
  delete cleaned.selectDefault
  return cleaned
}

function cleanData(data: CustomFieldsSettings): CustomFieldsSettings {
  if (!data.fields) return data

  return {
    ...data,
    fields: data.fields.map((field) => ({
      ...field,
      fieldConfig: field.fieldConfig ? cleanFieldConfig(field.fieldConfig) : field.fieldConfig
    })) as CustomFieldDefinition[]
  }
}

// Handle FormRenderer updates - clean and emit
function handleInternalUpdate(value: Record<string, unknown>) {
  // Cast is safe - FormRenderer emits the same structure we passed in
  emit('update:modelValue', cleanData(value as unknown as CustomFieldsSettings))
}

function handleSubmit() {
  emit('submit')
}

const configSection = createCustomFieldsConfigSection()
</script>

<template>
  <FormRenderer
    :model-value="internalData"
    :section="configSection"
    validate-on-mount
    update-only-when-valid
    @update:model-value="handleInternalUpdate"
    @submit="handleSubmit"
  />
</template>
