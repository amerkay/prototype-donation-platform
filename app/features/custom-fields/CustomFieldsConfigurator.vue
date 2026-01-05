<script setup lang="ts">
import { computed } from 'vue'
import { createCustomFieldsConfigSection } from './forms/custom-fields-config-form'
import FormRenderer from '~/features/form-builder/FormRenderer.vue'
import type { CustomFieldsSettings } from './types'
import type { ContextSchema } from '~/features/form-builder/conditions'

interface Props {
  modelValue: CustomFieldsSettings
  contextSchema?: ContextSchema
}

const props = defineProps<Props>()
const emit = defineEmits<{
  'update:modelValue': [value: CustomFieldsSettings]
  submit: []
}>()

const configSection = computed(() => createCustomFieldsConfigSection(props.contextSchema))
</script>

<template>
  <FormRenderer
    :model-value="modelValue as unknown as Record<string, unknown>"
    :section="configSection"
    :context-schema="contextSchema"
    validate-on-mount
    update-only-when-valid
    @update:model-value="emit('update:modelValue', $event as unknown as CustomFieldsSettings)"
    @submit="emit('submit')"
  />
</template>
