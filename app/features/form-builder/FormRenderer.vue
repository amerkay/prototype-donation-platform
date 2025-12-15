<script setup lang="ts">
import { ref, computed, watch, provide, nextTick } from 'vue'
import { useForm } from 'vee-validate'
import { Accordion } from '@/components/ui/accordion'
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

// Accordion state for collapsible field groups
const accordionValue = ref<string | undefined>(undefined)
provide('accordionValue', accordionValue)

// Check if we have any collapsible field groups
const hasCollapsibleGroups = computed(() => {
  return allFields.value.some(([, fieldMeta]) => {
    return fieldMeta.type === 'field-group' && fieldMeta.collapsible
  })
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
  <form :class="props.class" @submit.prevent="onSubmit">
    <Accordion
      v-if="hasCollapsibleGroups"
      v-model="accordionValue"
      type="single"
      collapsible
      class="w-full"
    >
      <div
        v-for="([fieldKey, fieldMeta], index) in allFields"
        :key="`${fieldKey}-${index}`"
        :ref="(el) => setElementRef(String(fieldKey), el as HTMLElement | null)"
      >
        <FormField :name="String(fieldKey)" :meta="fieldMeta" />
      </div>
    </Accordion>
    <div v-else class="space-y-4">
      <div
        v-for="([fieldKey, fieldMeta], index) in allFields"
        :key="`${fieldKey}-${index}`"
        :ref="(el) => setElementRef(String(fieldKey), el as HTMLElement | null)"
        class=""
      >
        <FormField :name="String(fieldKey)" :meta="fieldMeta" />
      </div>
    </div>
  </form>
</template>
