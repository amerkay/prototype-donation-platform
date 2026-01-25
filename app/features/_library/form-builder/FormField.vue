<script setup lang="ts">
import { computed, watch, type Component } from 'vue'
import { useField, useFormErrors } from 'vee-validate'
import { toTypedSchema } from '@vee-validate/zod'
import * as z from 'zod'
import type { FieldDef, SetFieldValueFn, FieldType } from '~/features/_library/form-builder/types'
import {
  resolveVeeFieldPath,
  checkFieldVisibility,
  joinPath,
  sanitizePathToId
} from '~/features/_library/form-builder/composables/useFieldPath'
import { useFormBuilderContext } from '~/features/_library/form-builder/composables/useFormBuilderContext'
import { extractDefaultValues } from '~/features/_library/form-builder/utils/defaults'
import { cn } from '@/lib/utils'
import FormFieldText from './fields/FormFieldText.vue'
import FormFieldTextarea from './fields/FormFieldTextarea.vue'
import FormFieldNumber from './fields/FormFieldNumber.vue'
import FormFieldCurrency from './fields/FormFieldCurrency.vue'
import FormFieldHidden from './fields/FormFieldHidden.vue'
import FormFieldToggle from './fields/FormFieldToggle.vue'
import FormFieldCheckbox from './fields/FormFieldCheckbox.vue'
import FormFieldSelect from './fields/FormFieldSelect.vue'
import FormFieldCombobox from './fields/FormFieldCombobox.vue'
import FormFieldRadioGroup from './fields/FormFieldRadioGroup.vue'
import FormFieldSlider from './fields/FormFieldSlider.vue'
import FormFieldAutocomplete from './fields/FormFieldAutocomplete.vue'
import FormFieldEmoji from './fields/FormFieldEmoji.vue'
import FormFieldImageUpload from './fields/FormFieldImageUpload.vue'
import FormFieldComponent from './fields/FormFieldComponent.vue'
import FormFieldArray from './containers/FormFieldArray.vue'
import FormFieldGroup from './containers/FormFieldGroup.vue'
import FormFieldTabs from './containers/FormFieldTabs.vue'
import FormFieldCard from './layout/FormFieldCard.vue'

interface Props {
  name: string
  meta: FieldDef
  class?: string
}

const props = defineProps<Props>()

// Component registry - maps field types to their components
const FIELD_COMPONENTS: Record<string, Component> = {
  checkbox: FormFieldCheckbox,
  text: FormFieldText,
  textarea: FormFieldTextarea,
  number: FormFieldNumber,
  currency: FormFieldCurrency,
  hidden: FormFieldHidden,
  toggle: FormFieldToggle,
  select: FormFieldSelect,
  combobox: FormFieldCombobox,
  autocomplete: FormFieldAutocomplete,
  'radio-group': FormFieldRadioGroup,
  emoji: FormFieldEmoji,
  slider: FormFieldSlider,
  'image-upload': FormFieldImageUpload,
  component: FormFieldComponent,
  card: FormFieldCard,
  'field-group': FormFieldGroup,
  array: FormFieldArray,
  tabs: FormFieldTabs
}

// Inject common form builder context (includes formValues via vee-validate)
const {
  sectionId,
  fieldPrefix,
  formValues,
  fieldContext,
  parentGroupVisible,
  validateOnMount,
  setFieldValue
} = useFormBuilderContext()

// Resolve dynamic field type if it's a function
const resolvedFieldType = computed(() => {
  const { type } = props.meta
  if (typeof type === 'function') {
    return (type as (values: Record<string, unknown>) => FieldType)(formValues.value)
  }
  return type as FieldType
})

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

// Generate unique HTML ID from vee-validate path
// Ensures no duplicate IDs across array items or nested field-groups
const fieldId = computed(() => sanitizePathToId(resolvedVeeName.value))

// Check if field should be visible using unified visibility utility
const isVisible = computed(() => {
  return checkFieldVisibility(props.meta, fieldContext.value, {
    parentVisible: parentGroupVisible()
  })
})

// Convert Zod rules to typed schema for vee-validate
// When field is hidden, always return optional schema to skip validation
// EXCEPT for field-group/tabs - they should validate children even when collapsed
const fieldRules = computed(() => {
  // Check visibility without container validation exception for field-level rules
  const isVisibleForValidation = checkFieldVisibility(props.meta, fieldContext.value, {
    parentVisible: parentGroupVisible(),
    skipContainerValidation: true
  })
  if (!isVisibleForValidation) {
    return toTypedSchema(z.any().optional())
  }

  if (!props.meta.rules) return undefined

  // If rules is a function/computed, resolve it with current form values
  let rules =
    typeof props.meta.rules === 'function'
      ? props.meta.rules(fieldContext.value)
      : 'value' in props.meta.rules
        ? props.meta.rules.value
        : props.meta.rules

  // Apply smart preprocessing: if field has explicit defaultValue, ensure undefined → defaultValue
  // This prevents "expected string, received undefined" errors when fields are cleared
  if ('defaultValue' in props.meta && props.meta.defaultValue !== undefined) {
    const defaultValue = props.meta.defaultValue
    rules = z.preprocess((val) => (val === undefined || val === null ? defaultValue : val), rules)
  }

  return toTypedSchema(rules)
})

// Container fields don't need field binding (they manage children)
const isContainerField = computed(() => {
  return ['field-group', 'tabs', 'card'].includes(resolvedFieldType.value)
})

// Use vee-validate's useField composition API for non-container fields
// Container fields (groups, tabs) don't bind to form values
const fieldBinding = isContainerField.value
  ? null
  : useField(() => resolvedVeeName.value, fieldRules, {
      validateOnValueUpdate: true,
      syncVModel: false,
      keepValueOnUnmount: true,
      validateOnMount
    })

// Helper: Create scoped setValue that resolves relative paths
const createScopedSetValue = (): SetFieldValueFn => {
  return (relativePath: string, value: unknown) => {
    const absolutePath = joinPath(fieldPrefix, relativePath)
    setFieldValue(absolutePath, value)
  }
}

// Helper: Clear field without validation (for onVisibilityChange)
const clearFieldSilently = () => {
  if (!fieldBinding) return
  fieldBinding.setValue(undefined, false)
  fieldBinding.resetField({ value: undefined })
}

// Extract field value and validation attrs
const fieldValue = computed({
  get: () => (fieldBinding ? fieldBinding.value.value : undefined),
  set: (val) => {
    if (!fieldBinding) return

    fieldBinding.value.value = val

    if (props.meta.onChange) {
      const result = props.meta.onChange({
        value: val,
        ...fieldContext.value,
        setValue: createScopedSetValue()
      })

      // Auto-apply defaults from returned field metadata
      if (result && typeof result === 'object') {
        const defaults = extractDefaultValues(result as Record<string, FieldDef>)
        const scopedSetValue = createScopedSetValue()
        for (const [key, value] of Object.entries(defaults)) {
          scopedSetValue(key, value)
        }
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
  return FIELD_COMPONENTS[resolvedFieldType.value] || null
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

  // Container fields (group, tabs, card) don't need v-model or id
  if (isContainerField.value) {
    return baseProps
  }

  // Array field needs v-model and touched but NOT id (it's a container wrapper)
  if (resolvedFieldType.value === 'array') {
    return {
      ...baseProps,
      modelValue: fieldValue.value,
      touched: fieldMeta.value.touched
    }
  }

  // Add id for input fields (needed for label/input association)
  const propsWithId = {
    ...baseProps,
    id: fieldId.value
  }

  // Autocomplete needs fieldPrefix
  if (resolvedFieldType.value === 'autocomplete') {
    return {
      ...propsWithId,
      modelValue: fieldValue.value,
      fieldPrefix
    }
  }

  // Standard fields with v-model
  return {
    ...propsWithId,
    modelValue: fieldValue.value
  }
})

// Handle field visibility changes
watch(
  isVisible,
  (visible, wasVisible) => {
    if (!fieldBinding) return

    // Apply default value when field becomes visible
    if (visible && fieldValue.value === undefined && 'defaultValue' in props.meta) {
      fieldBinding.setValue(props.meta.defaultValue, false)
    }

    // Validate on visibility if validateOnMount enabled
    if (visible && !isContainerField.value && validateOnMount) {
      fieldBinding.validate()
    }

    // Call visibility change callback
    if (props.meta.onVisibilityChange && visible !== wasVisible) {
      props.meta.onVisibilityChange({
        visible,
        value: fieldValue.value,
        setValue: createScopedSetValue(),
        clearValue: clearFieldSilently,
        path: props.name,
        ...fieldContext.value
      })
    }
  },
  { immediate: true }
)
</script>

<template>
  <Transition
    enter-active-class="transition-all duration-300 ease-out"
    leave-active-class="transition-all duration-200 ease-in"
    enter-from-class="opacity-0 -translate-y-2"
    enter-to-class="opacity-100 translate-y-0"
    leave-from-class="opacity-100 translate-y-0"
    leave-to-class="opacity-0 -translate-y-2"
  >
    <component
      :is="fieldComponent"
      v-if="fieldComponent && isVisible"
      v-bind="fieldProps"
      @update:model-value="fieldValue = $event"
    />
    <div v-else-if="isVisible" class="text-destructive text-sm">
      Unknown field type: {{ resolvedFieldType }}
    </div>
  </Transition>
</template>
