<script setup lang="ts">
import { ref, computed, watch, provide, nextTick } from 'vue'
import { useForm } from 'vee-validate'
import { Accordion } from '@/components/ui/accordion'
import { FieldSeparator } from '@/components/ui/field'
import FormField from './FormField.vue'
import type { FormDef } from '~/features/form-builder/form-builder-types'
import { useScrollOnVisible } from './composables/useScrollOnVisible'

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

// Check if the current field is the last visible field
const isLastVisibleField = (currentIndex: number) => {
  const visibleFieldsAfter = allFields.value
    .slice(currentIndex + 1)
    .filter(([, fieldMeta]) => isFieldVisible(fieldMeta))

  return visibleFieldsAfter.length === 0
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
    <div v-if="section.title || section.description" class="mb-6">
      <h2 v-if="section.title" class="text-sm font-semibold">{{ section.title }}</h2>
      <p v-if="section.description" class="text-muted-foreground text-sm mt-1">
        {{ section.description }}
      </p>
    </div>

    <Accordion
      v-if="hasCollapsibleGroups"
      v-model="accordionValue"
      type="single"
      collapsible
      class="w-full"
    >
      <template v-for="([fieldKey, fieldMeta], index) in allFields" :key="`${fieldKey}-${index}`">
        <FieldSeparator v-if="shouldShowSeparator(index, fieldMeta)" class="my-2" />
        <div :ref="(el) => setElementRef(String(fieldKey), el as HTMLElement | null)">
          <FormField :name="`${section.id}.${fieldKey}`" :meta="fieldMeta" />
        </div>
      </template>
    </Accordion>
    <template v-else>
      <template v-for="([fieldKey, fieldMeta], index) in allFields" :key="`${fieldKey}-${index}`">
        <FieldSeparator v-if="shouldShowSeparator(index, fieldMeta)" class="my-2" />
        <div :ref="(el) => setElementRef(String(fieldKey), el as HTMLElement | null)">
          <FormField
            :name="`${section.id}.${fieldKey}`"
            :meta="fieldMeta"
            :class="!isLastVisibleField(index) ? 'my-3' : ''"
          />
        </div>
      </template>
    </template>
  </form>
</template>
