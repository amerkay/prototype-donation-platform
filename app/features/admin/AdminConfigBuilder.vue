<script setup lang="ts" generic="T extends Record<string, unknown>">
import FormRenderer from '@/features/form-builder/FormRenderer.vue'
import type { ConfigSectionDef } from '@/features/form-builder/form-builder-types'

interface Props {
  section: ConfigSectionDef
  modelValue: T
}

defineProps<Props>()

const emit = defineEmits<{
  'update:modelValue': [value: T]
}>()

function handleUpdate(value: Record<string, unknown>) {
  emit('update:modelValue', value as T)
}
</script>

<template>
  <div class="px-6 py-2">
    <FormRenderer :section="section" :model-value="modelValue" @update:model-value="handleUpdate" />
  </div>
</template>
