<script setup lang="ts">
import { computed, inject, type Component } from 'vue'
import { useField, useFormErrors } from 'vee-validate'
import { toTypedSchema } from '@vee-validate/zod'
import * as z from 'zod'
import type { FieldMeta, SetFieldValueFn } from '~/features/form-builder/form-builder-types'
import { resolveVeeFieldPath } from '~/features/form-builder/field-path-utils'
import { useFormBuilderContext } from '~/features/form-builder/composables/useFormBuilderContext'
import { cn } from '@/lib/utils'
import FormFieldText from './fields/FormFieldText.vue'
import FormFieldTextarea from './fields/FormFieldTextarea.vue'
import FormFieldNumber from './fields/FormFieldNumber.vue'
import FormFieldCurrency from './fields/FormFieldCurrency.vue'
import FormFieldToggle from './fields/FormFieldToggle.vue'
import FormFieldSelect from './fields/FormFieldSelect.vue'
import FormFieldCombobox from './fields/FormFieldCombobox.vue'
import FormFieldRadioGroup from './fields/FormFieldRadioGroup.vue'
import FormFieldSlider from './fields/FormFieldSlider.vue'
import FormFieldCard from './fields/FormFieldCard.vue'
import FormFieldSeparator from './fields/FormFieldSeparator.vue'
import FormFieldGroup from './fields/FormFieldGroup.vue'
import FormFieldTabs from './fields/FormFieldTabs.vue'
import FormFieldAutocomplete from './fields/FormFieldAutocomplete.vue'
import FormFieldEmoji from './fields/FormFieldEmoji.vue'
import FormFieldArray from './fields/FormFieldArray.vue'

interface Props {
  name: string
  meta: FieldMeta
  class?: string
}

const props = defineProps<Props>()

// Component registry - maps field types to their components
const FIELD_COMPONENTS: Record<string, Component> = {
  text: FormFieldText,
  textarea: FormFieldTextarea,
  number: FormFieldNumber,
  currency: FormFieldCurrency,
  toggle: FormFieldToggle,
  select: FormFieldSelect,
  combobox: FormFieldCombobox,
  autocomplete: FormFieldAutocomplete,
  'radio-group': FormFieldRadioGroup,
  emoji: FormFieldEmoji,
  slider: FormFieldSlider,
  card: FormFieldCard,
  separator: FormFieldSeparator,
  'field-group': FormFieldGroup,
  array: FormFieldArray,
  tabs: FormFieldTabs
}

// Inject common form builder context (includes formValues via vee-validate)
const { sectionId, fieldPrefix, formValues, parentGroupVisible } = useFormBuilderContext()

// Inject setFieldValue function from FormRenderer
const setFieldValue = inject<SetFieldValueFn>('setFieldValue', () => {})

// Resolve the vee-validate field path.
// - Top-level fields are already passed as `${sectionId}.${fieldKey}` from FormRenderer.
// - Fields inside containers (e.g. field-group) can pass relative names like `address1`.
const resolvedVeeName = computed(() => {
  return resolveVeeFieldPath({
    name: props.name,
    sectionId,
    fieldPrefix
  })
})

// Check if field should be visible
const isVisible = computed(() => {
  // First check if parent group is visible
  if (!parentGroupVisible()) return false

  // Then check this field's own visibility
  if (!props.meta.visibleWhen) return true
  return props.meta.visibleWhen(formValues.value)
})

// Convert Zod rules to typed schema for vee-validate
// When field is hidden, always return optional schema to skip validation
// EXCEPT for field-group/tabs - they should validate children even when collapsed
const fieldRules = computed(() => {
  // If field is hidden, no validation needed (except container fields)
  const isContainerField = props.meta.type === 'field-group' || props.meta.type === 'tabs'
  if (!isVisible.value && !isContainerField) {
    return toTypedSchema(z.any().optional())
  }

  if (!props.meta.rules) return undefined

  // If rules is a function, call it with current form values
  let rules =
    typeof props.meta.rules === 'function' ? props.meta.rules(formValues.value) : props.meta.rules

  // Preprocess fields to handle undefined/null values
  const isTextLikeField = ['text', 'textarea', 'autocomplete', 'select', 'emoji'].includes(
    props.meta.type
  )
  const isBooleanField = props.meta.type === 'toggle'

  if (isTextLikeField || isBooleanField) {
    rules = z.preprocess((val) => {
      if (val === undefined || val === null) {
        return isBooleanField ? false : ''
      }
      return val
    }, rules)
  }

  return toTypedSchema(rules)
})

// Container fields don't need field binding (they manage children)
const isContainerField = computed(() => {
  return ['field-group', 'tabs', 'card', 'separator'].includes(props.meta.type)
})

// Use vee-validate's useField composition API for non-container fields
// Container fields (groups, tabs) don't bind to form values
const fieldBinding = isContainerField.value
  ? null
  : useField(() => resolvedVeeName.value, fieldRules, {
      validateOnValueUpdate: true,
      syncVModel: false
    })

// Extract field value and validation attrs
const fieldValue = computed({
  get: () => (fieldBinding ? fieldBinding.value.value : undefined),
  set: (val) => {
    if (fieldBinding) {
      fieldBinding.value.value = val
      // Trigger onChange callback if provided
      if (props.meta.onChange) {
        props.meta.onChange(val, formValues.value, setFieldValue)
      }
    }
  }
})

// Get validation attributes for input binding
const fieldAttrs = computed(() => {
  if (!fieldBinding) return {}

  return {
    onBlur: fieldBinding.handleBlur
  }
})

// Get field-specific errors from form errors
const formErrors = useFormErrors()
const fieldErrors = computed(() => {
  const errorMsg = formErrors.value[resolvedVeeName.value]
  return errorMsg ? [errorMsg] : []
})

// Get field metadata (touched state, etc.)
const fieldMeta = computed(() => ({
  touched: fieldBinding?.meta.touched ?? false,
  dirty: fieldBinding?.meta.dirty ?? false,
  valid: fieldBinding?.meta.valid ?? true
}))

// Resolve the component for this field type
const fieldComponent = computed(() => {
  return FIELD_COMPONENTS[props.meta.type] || null
})

// Props to pass to field components
const fieldProps = computed(() => {
  const baseProps = {
    meta: props.meta,
    name: props.name,
    class: cn(props.class),
    errors: fieldErrors.value,
    onBlur: fieldAttrs.value.onBlur
  }

  // Container fields (group, tabs, card, separator) don't need v-model
  if (isContainerField.value) {
    return baseProps
  }

  // Array field needs touched state
  if (props.meta.type === 'array') {
    return {
      ...baseProps,
      modelValue: fieldValue.value,
      touched: fieldMeta.value.touched
    }
  }

  // Autocomplete needs fieldPrefix
  if (props.meta.type === 'autocomplete') {
    return {
      ...baseProps,
      modelValue: fieldValue.value,
      fieldPrefix
    }
  }

  // Standard fields with v-model
  return {
    ...baseProps,
    modelValue: fieldValue.value
  }
})
</script>

<template>
  <Transition
    v-show="isVisible"
    enter-active-class="transition-all duration-300 ease-out"
    leave-active-class="transition-all duration-200 ease-in"
    enter-from-class="opacity-0 -translate-y-2"
    enter-to-class="opacity-100 translate-y-0"
    leave-from-class="opacity-100 translate-y-0"
    leave-to-class="opacity-0 -translate-y-2"
  >
    <component
      :is="fieldComponent"
      v-if="fieldComponent"
      v-bind="fieldProps"
      @update:model-value="fieldValue = $event"
    />
    <div v-else class="text-destructive text-sm">
      Unknown field type: {{ (meta as { type: string }).type }}
    </div>
  </Transition>
</template>
