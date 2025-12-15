<script setup lang="ts">
import { computed } from 'vue'
import FormRenderer from '@/features/form-builder/FormRenderer.vue'
import { createTributeConfigSection } from '~/features/donation-form/tribute/form-builder/tribute-config'
import type { FormConfig } from '@/lib/common/types'

interface Props {
  modelValue: FormConfig['features']['tribute']
}

const props = defineProps<Props>()

const emit = defineEmits<{
  'update:modelValue': [value: FormConfig['features']['tribute']]
}>()

// Create the tribute config section
const tributeConfigSection = createTributeConfigSection()

// Extract the subset of tribute config that matches our schema
const tributeConfig = computed(() => ({
  enabled: props.modelValue.enabled,
  icons: props.modelValue.icons,
  types: props.modelValue.types,
  modal: props.modelValue.modal
}))

// Handle updates from FormRenderer
function handleTributeUpdate(value: Record<string, unknown>) {
  emit('update:modelValue', {
    ...props.modelValue,
    ...(value as typeof tributeConfig.value)
  })
}
</script>

<template>
  <div class="space-y-2">
    <FormRenderer
      :section="tributeConfigSection"
      :model-value="tributeConfig"
      @update:model-value="handleTributeUpdate"
    />
  </div>
</template>
