<script setup lang="ts">
import { ref, computed, watch, provide, nextTick } from 'vue'
import { useForm } from 'vee-validate'
import { Accordion } from '@/components/ui/accordion'
import { Separator } from '@/components/ui/separator'
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

// Transform initial values to nest under section ID for unique field names
const initialFormValues = computed(() => ({
  [props.section.id]: props.modelValue
}))

// Use the composition API to access form context
const { values, meta, setValues, handleSubmit } = useForm({
  initialValues: initialFormValues.value,
  validateOnMount: false
})

// Provide form values to child fields for conditional visibility
// Unwrap from section ID prefix to match expected structure
provide('formValues', () => {
  const sectionValues = (values as Record<string, unknown>)[props.section.id]
  return (sectionValues as Record<string, unknown>) || {}
})

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

// Track which fields are visible for separator logic
const isFieldVisible = (fieldMeta: (typeof props.section.fields)[string]) => {
  if (!fieldMeta.visibleWhen) return true
  const sectionValues = (values as Record<string, unknown>)[props.section.id]
  return fieldMeta.visibleWhen((sectionValues as Record<string, unknown>) || {})
}

// Check if there's any visible field before the current index
const shouldShowSeparator = (
  currentIndex: number,
  currentFieldMeta: (typeof props.section.fields)[string]
) => {
  if (!isFieldVisible(currentFieldMeta)) return false

  // Find the last visible field before current
  const visibleFieldsBefore = allFields.value
    .slice(0, currentIndex)
    .filter(([, fieldMeta]) => isFieldVisible(fieldMeta))

  if (visibleFieldsBefore.length === 0) return false

  // Check if the previous visible field has isNoSeparatorAfter flag
  const lastVisibleField = visibleFieldsBefore[visibleFieldsBefore.length - 1]
  if (!lastVisibleField) return false

  return !lastVisibleField[1].isNoSeparatorAfter
}

// Auto-scroll to newly visible fields (scroll to top of element)
const { setElementRef } = useScrollOnVisible(allFields, {
  isVisible: ([, fieldMeta]) => {
    if (!fieldMeta.visibleWhen) return true
    const sectionValues = (values as Record<string, unknown>)[props.section.id]
    return fieldMeta.visibleWhen((sectionValues as Record<string, unknown>) || {})
  },
  getKey: ([key]) => key
})

// Watch for external changes to modelValue
let isUpdatingFromProp = false
watch(
  () => props.modelValue,
  (newValue) => {
    isUpdatingFromProp = true
    setValues({ [props.section.id]: newValue })
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
      const sectionValues = (newValues as Record<string, unknown>)[props.section.id]
      emit('update:modelValue', (sectionValues as Record<string, unknown>) || {})
    }
  },
  { deep: true }
)

// Handle form submission
const onSubmit = handleSubmit((submittedValues) => {
  const sectionValues = (submittedValues as Record<string, unknown>)[props.section.id]
  emit('update:modelValue', (sectionValues as Record<string, unknown>) || {})
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
      <template v-for="([fieldKey, fieldMeta], index) in allFields" :key="`${fieldKey}-${index}`">
        <Separator v-if="shouldShowSeparator(index, fieldMeta)" />
        <div :ref="(el) => setElementRef(String(fieldKey), el as HTMLElement | null)">
          <FormField :name="`${section.id}.${fieldKey}`" :meta="fieldMeta" />
        </div>
      </template>
    </Accordion>
    <div v-else class="space-y-3">
      <template v-for="([fieldKey, fieldMeta], index) in allFields" :key="`${fieldKey}-${index}`">
        <Separator v-if="shouldShowSeparator(index, fieldMeta)" class="my-4" />
        <div :ref="(el) => setElementRef(String(fieldKey), el as HTMLElement | null)">
          <FormField :name="`${section.id}.${fieldKey}`" :meta="fieldMeta" class="my-3" />
        </div>
      </template>
    </div>
  </form>
</template>
