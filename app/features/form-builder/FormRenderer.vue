<script setup lang="ts">
import { computed, watch, provide, toRaw } from 'vue'
import { useForm } from 'vee-validate'
import FormFieldList from './internal/FormFieldList.vue'
import type { FormDef } from '~/features/form-builder/types'
import type { ContextSchema } from '~/features/form-builder/conditions'
import { useScrollOnVisible } from './composables/useScrollOnVisible'
import { checkFieldVisibility } from './composables/useFieldPath'
import { useAccordionGroup } from './composables/useAccordionGroup'

interface Props {
  section: FormDef
  modelValue: Record<string, unknown>
  class?: string
  /**
   * External context values to merge with form values
   * Used for conditional visibility and dynamic options
   * @default {}
   */
  context?: Record<string, unknown>
  /**
   * Schema describing external context fields
   * Used by condition builder UI to show available fields
   */
  contextSchema?: ContextSchema
  /**
   * Validate all fields immediately on mount.
   * @default false
   */
  validateOnMount?: boolean
  /**
   * Only emit update:modelValue when form is valid.
   * Useful for admin configs where invalid state shouldn't propagate.
   * @default false
   */
  updateOnlyWhenValid?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  context: () => ({}),
  validateOnMount: false,
  updateOnlyWhenValid: false
})

const emit = defineEmits<{
  'update:modelValue': [value: Record<string, unknown>]
  submit: []
}>()

function safeCloneRecord(value: Record<string, unknown>): Record<string, unknown> {
  return JSON.parse(JSON.stringify(value)) as Record<string, unknown>
}

const emitSectionValue = (value: Record<string, unknown>) => {
  emit('update:modelValue', safeCloneRecord(toRaw(value) as Record<string, unknown>))
}

// Transform initial values to nest under section ID for unique field names
const initialFormValues = computed(() => ({
  // IMPORTANT: clone to avoid vee-validate mutating the Pinia store by reference
  [props.section.id]: safeCloneRecord(toRaw(props.modelValue) as Record<string, unknown>)
}))

// Use the composition API to access form context
const {
  values,
  meta,
  validate,
  handleSubmit,
  setFieldValue,
  setFieldTouched,
  setFieldError,
  errors
} = useForm({
  initialValues: initialFormValues.value,
  keepValuesOnUnmount: true, // Always true - values persist through accordion/tab unmount cycles
  validateOnMount: props.validateOnMount
})

// Provide section id so nested fields can resolve absolute vee-validate names
provide('sectionId', props.section.id)

// Provide validateOnMount for all nested fields and containers
provide('validateOnMount', props.validateOnMount)

// Provide accordion group for top-level collapsible field-groups
const { provideAccordionGroup } = useAccordionGroup()
provideAccordionGroup()

// Provide external context values and schema for condition evaluation
// Use toRef/computed to make them reactive so conditions re-evaluate on changes
const externalContext = computed(() => props.context || {})
const contextSchemaRef = computed(() => props.contextSchema || {})

provide('externalContext', externalContext)
provide('contextSchema', contextSchemaRef)

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

// Provide setFieldError and setFieldTouched for programmatic validation control
provide('setFieldError', setFieldError)
provide('setFieldTouched', setFieldTouched)

// All fields - we render all of them, visibility is handled by FormField
const allFields = computed(() => {
  return Object.entries(props.section.fields)
})

// Extract section values to avoid repeated casting
const sectionValues = computed(() => {
  return ((values as Record<string, unknown>)[props.section.id] as Record<string, unknown>) || {}
})

// Create field context for visibility checks
const sectionFieldContext = computed(() => ({
  values: sectionValues.value,
  root: values
}))

// Auto-scroll to newly visible fields (scroll to top of element)
const { setElementRef } = useScrollOnVisible(allFields, {
  isVisible: ([, fieldMeta]) =>
    checkFieldVisibility(fieldMeta, sectionFieldContext.value, { skipContainerValidation: true }),
  getKey: ([key]) => key
})

// Emit changes when form values update
// Use debounce to let rapid changes settle before validating
let validationTimeout: ReturnType<typeof setTimeout> | null = null

watch(
  sectionValues,
  (value) => {
    if (!props.updateOnlyWhenValid) {
      emitSectionValue(value)
      return
    }

    // Clear any pending validation - we'll use the latest value
    if (validationTimeout) {
      clearTimeout(validationTimeout)
    }

    // Debounce validation to let rapid changes settle
    validationTimeout = setTimeout(async () => {
      validationTimeout = null
      await validate()

      // Filter errors to only those from visible fields - hidden fields should not block updates
      const visibleFieldErrors = Object.keys(errors.value).filter((errorPath) => {
        // Remove section prefix to match field keys
        const fieldPath = errorPath.replace(`${props.section.id}.`, '')
        const fieldKey = fieldPath.split(/[.[\]]/)[0] || '' // Extract top-level field key
        const fieldMeta = props.section.fields[fieldKey]
        if (!fieldMeta) return true // Keep errors for unknown fields (shouldn't happen)

        return checkFieldVisibility(fieldMeta, sectionFieldContext.value, {
          skipContainerValidation: true
        })
      })

      // Only check visible field errors - ignore valid flag as it includes hidden fields
      if (visibleFieldErrors.length === 0) {
        // Emit current sectionValues (not stale closure value)
        emitSectionValue(sectionValues.value)
      }
    }, 0) // Use 0ms - just moves to next tick to batch synchronous changes
  },
  { deep: true, flush: 'post' }
)

// Handle form submission
const onSubmit = handleSubmit((submittedValues) => {
  const currentSectionValues =
    ((submittedValues as Record<string, unknown>)[props.section.id] as Record<string, unknown>) ||
    {}
  emitSectionValue(currentSectionValues)
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

    <FormFieldList
      :fields="section.fields"
      :field-context="sectionFieldContext"
      :name-prefix="section.id"
      :set-element-ref="setElementRef"
    />
  </form>
</template>
