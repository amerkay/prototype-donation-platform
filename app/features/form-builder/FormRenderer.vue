<script setup lang="ts">
import { computed, watch, provide, nextTick, toRaw } from 'vue'
import { useForm } from 'vee-validate'
import { FieldSeparator } from '@/components/ui/field'
import FormField from './FormField.vue'
import type { FormDef } from '~/features/form-builder/types'
import { useScrollOnVisible } from './composables/useScrollOnVisible'
import { checkFieldVisibility } from './composables/useFieldPath'

interface Props {
  section: FormDef
  modelValue: Record<string, unknown>
  class?: string
  /**
   * Keep field values in vee-validate when component unmounts.
   * Useful for multi-step wizards with v-if navigation.
   * @default false
   */
  keepValuesOnUnmount?: boolean
  /**
   * Validate all fields immediately on mount.
   * @default false
   */
  validateOnMount?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  keepValuesOnUnmount: false,
  validateOnMount: false
})

const emit = defineEmits<{
  'update:modelValue': [value: Record<string, unknown>]
  submit: []
}>()

// Transform initial values to nest under section ID for unique field names
const initialFormValues = computed(() => ({
  [props.section.id]: props.modelValue
}))

// Use the composition API to access form context
const { values, meta, setValues, handleSubmit, setFieldValue, setFieldTouched } = useForm({
  initialValues: initialFormValues.value,
  keepValuesOnUnmount: props.keepValuesOnUnmount,
  validateOnMount: props.validateOnMount
})

// Provide section id so nested fields can resolve absolute vee-validate names
provide('sectionId', props.section.id)

// Provide setFieldValue for onChange callbacks
// Wrap to add section ID prefix and emit immediately for reactivity
const providedSetFieldValue = (path: string, value: unknown): void => {
  // Construct full path with section ID prefix
  const fullPath = `${props.section.id}.${path}`

  // Type assertion is safe here because:
  // 1. vee-validate's setFieldValue accepts any path string
  // 2. Runtime validation via Zod schemas ensures type correctness
  // 3. The generic constraint in useForm would require compile-time type knowledge
  //    which we don't have for dynamic forms
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  setFieldValue(fullPath, value as any)

  // Mark the target field as touched and trigger validation so
  // programmatic updates (e.g. via onChange handlers) surface errors
  setFieldTouched(fullPath, true)
}

provide('setFieldValue', providedSetFieldValue)

// Provide submit function for Enter key handling in text fields
provide('submitForm', () => {
  onSubmit()
})

// All fields - we render all of them, visibility is handled by FormField
const allFields = computed(() => {
  return Object.entries(props.section.fields)
})

// Extract section values to avoid repeated casting
const sectionValues = computed(() => {
  return ((values as Record<string, unknown>)[props.section.id] as Record<string, unknown>) || {}
})

// Track which fields are visible for separator logic (using unified visibility check)
// Skip container validation since we want actual visibility, not validation behavior
const isFieldVisible = (fieldMeta: (typeof props.section.fields)[string]) => {
  return checkFieldVisibility(fieldMeta, sectionValues.value, {
    skipContainerValidation: true
  })
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

// Check if a field is a visible collapsible accordion
const isVisibleCollapsibleGroup = (fieldMeta: (typeof props.section.fields)[string]) => {
  return (
    fieldMeta.type === 'field-group' && fieldMeta.collapsible === true && isFieldVisible(fieldMeta)
  )
}

// Check if the current field is the last visible field
const isLastVisibleField = (currentIndex: number) => {
  const visibleFieldsAfter = allFields.value
    .slice(currentIndex + 1)
    .filter(([, fieldMeta]) => isFieldVisible(fieldMeta))

  return visibleFieldsAfter.length === 0
}

// Auto-scroll to newly visible fields (scroll to top of element)
// Skip container validation since we want actual visibility for scroll behavior
const { setElementRef } = useScrollOnVisible(allFields, {
  isVisible: ([, fieldMeta]) =>
    checkFieldVisibility(fieldMeta, sectionValues.value, { skipContainerValidation: true }),
  getKey: ([key]) => key
})

// Watch for external changes to modelValue
let isUpdatingFromProp = false
watch(
  () => props.modelValue,
  (newValue) => {
    isUpdatingFromProp = true
    // Use toRaw() to prevent vee-validate from caching readonly proxies
    const rawValue = toRaw(newValue)
    setValues({ [props.section.id]: rawValue }, false)
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
      const currentSectionValues =
        ((newValues as Record<string, unknown>)[props.section.id] as Record<string, unknown>) || {}
      emit('update:modelValue', currentSectionValues)
    }
  },
  { deep: true }
)

// Handle form submission
const onSubmit = handleSubmit((submittedValues) => {
  const currentSectionValues =
    ((submittedValues as Record<string, unknown>)[props.section.id] as Record<string, unknown>) ||
    {}
  emit('update:modelValue', currentSectionValues)
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
    <div v-if="section.title || section.description" class="mb-6">
      <h2 v-if="section.title" class="text-sm font-semibold">{{ section.title }}</h2>
      <p v-if="section.description" class="text-muted-foreground text-sm mt-1">
        {{ section.description }}
      </p>
    </div>

    <template v-for="([fieldKey, fieldMeta], index) in allFields" :key="`${fieldKey}-${index}`">
      <FieldSeparator v-if="shouldShowSeparator(index, fieldMeta)" class="my-4! h-1" />
      <div
        :ref="(el) => setElementRef(String(fieldKey), el as HTMLElement | null)"
        :class="[
          isVisibleCollapsibleGroup(fieldMeta) ? '-my-2!' : '',
          !isLastVisibleField(index) ? 'mb-4' : ''
        ]"
      >
        <FormField :name="`${section.id}.${fieldKey}`" :meta="fieldMeta" />
      </div>
    </template>
  </form>
</template>
