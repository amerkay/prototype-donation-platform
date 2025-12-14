<script setup lang="ts">
import { computed, watch, provide } from 'vue'
import { toTypedSchema } from '@vee-validate/zod'
import { useForm } from 'vee-validate'
import FormField from './FormField.vue'
import type { ConfigSectionDef } from '@/lib/form-builder/types'

interface Props {
  section: ConfigSectionDef
  modelValue: Record<string, unknown>
  class?: string
}

const props = defineProps<Props>()

const emit = defineEmits<{
  'update:modelValue': [value: Record<string, unknown>]
  submit: []
}>()

// Setup form with validation
const { values, setValues, meta, handleSubmit } = useForm({
  validationSchema: toTypedSchema(props.section.schema),
  initialValues: props.modelValue
})

// Provide form values to child fields for conditional visibility
provide('formValues', () => values as Record<string, unknown>)

// Watch for external changes to modelValue
watch(
  () => props.modelValue,
  (newValue) => {
    setValues(newValue)
  },
  { deep: true }
)

// Emit changes
watch(
  values,
  (newValues: Record<string, unknown>) => {
    emit('update:modelValue', newValues)
  },
  { deep: true }
)

// Expose validation state
const isValid = computed(() => meta.value.valid)

// Handle form submission
const onSubmit = handleSubmit(() => {
  emit('submit')
})

// Group fields by visibility to create visual sections
const visibleFields = computed(() => {
  const formVals = values as Record<string, unknown>
  return Object.entries(props.section.fields).filter(([, fieldMeta]) => {
    if (!fieldMeta.visibleWhen) return true
    return fieldMeta.visibleWhen(formVals)
  })
})

// Check which fields have conditional grid classes
const hasGridFields = computed(() => {
  return visibleFields.value.some(([, fieldMeta]) => fieldMeta.class?.includes('col-span'))
})

defineExpose({
  isValid,
  onSubmit
})
</script>

<template>
  <form :class="['space-y-6', props.class]" @submit.prevent="onSubmit">
    <div
      :class="{
        'grid grid-cols-2 gap-3': hasGridFields,
        'space-y-4': !hasGridFields
      }"
    >
      <FormField
        v-for="(fieldMeta, fieldKey) in section.fields"
        :key="fieldKey"
        :name="String(fieldKey)"
        :meta="fieldMeta"
      />
    </div>
  </form>
</template>
