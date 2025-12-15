<script setup lang="ts">
import { computed, watch, provide, nextTick } from 'vue'
import { useForm } from 'vee-validate'
import FormField from './FormField.vue'
import type { ConfigSectionDef } from '~/features/form-builder/form-builder-types'
import { useScrollOnVisible } from './composables/useScrollOnVisible'

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

// Use the composition API to access form context
const { values, meta, setValues, handleSubmit } = useForm({
  initialValues: props.modelValue,
  validateOnMount: false
})

// Provide form values to child fields for conditional visibility
provide('formValues', () => values as Record<string, unknown>)

// Provide submit function for Enter key handling in text fields
provide('submitForm', () => {
  onSubmit()
})

// All fields - we render all of them, visibility is handled by FormField
const allFields = computed(() => {
  return Object.entries(props.section.fields)
})

// Auto-scroll to newly visible fields (scroll to top of element)
const { setElementRef } = useScrollOnVisible(allFields, {
  isVisible: ([, fieldMeta]) => {
    if (!fieldMeta.visibleWhen) return true
    return fieldMeta.visibleWhen(values as Record<string, unknown>)
  },
  getKey: ([key]) => key
})

// Watch for external changes to modelValue
let isUpdatingFromProp = false
watch(
  () => props.modelValue,
  (newValue) => {
    isUpdatingFromProp = true
    setValues(newValue)
    nextTick(() => {
      isUpdatingFromProp = false
    })
  },
  { deep: true }
)

// Emit changes when form values update
watch(
  values,
  (newValues) => {
    if (!isUpdatingFromProp) {
      emit('update:modelValue', newValues as Record<string, unknown>)
    }
  },
  { deep: true }
)

// Handle form submission
const onSubmit = handleSubmit((submittedValues) => {
  emit('update:modelValue', submittedValues)
  emit('submit')
})

// Expose validation state
const isValid = computed(() => meta.value.valid)

defineExpose({
  isValid,
  onSubmit
})
</script>

<template>
  <form :class="['space-y-6', props.class]" @submit.prevent="onSubmit">
    <div
      v-for="([fieldKey, fieldMeta], index) in allFields"
      :key="`${fieldKey}-${index}`"
      :ref="(el) => setElementRef(String(fieldKey), el as HTMLElement | null)"
    >
      <FormField :name="String(fieldKey)" :meta="fieldMeta" />
    </div>
  </form>
</template>
