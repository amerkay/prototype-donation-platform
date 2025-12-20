<script setup lang="ts">
import { computed, inject } from 'vue'
import { Field as VeeField, useField } from 'vee-validate'
import { toTypedSchema } from '@vee-validate/zod'
import * as z from 'zod'
import type { FieldMeta, SetFieldValueFn } from '~/features/form-builder/form-builder-types'
import { resolveVeeFieldPath } from '~/features/form-builder/field-path-utils'
import FormFieldText from './fields/FormFieldText.vue'
import FormFieldTextarea from './fields/FormFieldTextarea.vue'
import FormFieldNumber from './fields/FormFieldNumber.vue'
import FormFieldToggle from './fields/FormFieldToggle.vue'
import FormFieldSelect from './fields/FormFieldSelect.vue'
import FormFieldCombobox from './fields/FormFieldCombobox.vue'
import FormFieldAutocomplete from './fields/FormFieldAutocomplete.vue'
import FormFieldRadioGroup from './fields/FormFieldRadioGroup.vue'
import FormFieldEmoji from './fields/FormFieldEmoji.vue'
import FormFieldSlider from './fields/FormFieldSlider.vue'
import FormFieldCard from './fields/FormFieldCard.vue'
import FormFieldSeparator from './fields/FormFieldSeparator.vue'
import FormFieldGroup from './fields/FormFieldGroup.vue'
import FormFieldArray from './fields/FormFieldArray.vue'
import FormFieldTabs from './fields/FormFieldTabs.vue'

interface Props {
  name: string
  meta: FieldMeta
}

const props = defineProps<Props>()

// Inject form values for conditional visibility
const formValues = inject<() => Record<string, unknown>>('formValues', () => ({}))

// Inject setFieldValue function from FormRenderer
const setFieldValue = inject<SetFieldValueFn>('setFieldValue', () => {})

// Inject parent group visibility (if this field is inside a field-group)
const parentGroupVisible = inject<() => boolean>('parentGroupVisible', () => true)

// Inject field prefix context for relative path computation
const fieldPrefix = inject<string>('fieldPrefix', '')

// Inject section id so child fields can use relative names
const sectionId = inject<string>('sectionId', '')

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
  return props.meta.visibleWhen(formValues())
})

// Convert Zod rules to typed schema for vee-validate
// When field is hidden, always return optional schema to skip validation
const fieldRules = computed(() => {
  // If field is hidden, no validation needed
  if (!isVisible.value) {
    return toTypedSchema(z.any().optional())
  }

  if (!props.meta.rules) return undefined

  // If rules is a function, call it with current form values
  let rules =
    typeof props.meta.rules === 'function' ? props.meta.rules(formValues()) : props.meta.rules

  // Preprocess text/textarea/autocomplete fields to handle undefined/null
  // This prevents "expected string, received undefined" errors when field is touched but empty
  const isTextLikeField = ['text', 'textarea', 'autocomplete'].includes(props.meta.type)

  if (isTextLikeField) {
    rules = z.preprocess((val) => {
      // Convert undefined/null to empty string for text-based fields
      if (val === undefined || val === null) {
        return ''
      }
      return val
    }, rules)
  }

  return toTypedSchema(rules)
})

// Use useField to get direct access to field state
useField(resolvedVeeName.value, fieldRules, {
  syncVModel: false,
  // Keep field value even when component unmounts (accordion closes)
  keepValueOnUnmount: true
})

// Handle field changes and call onChange callback if provided
const handleFieldChange = (value: unknown) => {
  if (props.meta.onChange) {
    props.meta.onChange(value, formValues(), setFieldValue)
  }
}

// Note: We don't reset field values when they become hidden
// This preserves user input when toggling visibility on/off
</script>

<template>
  <VeeField v-slot="{ field, errors, meta: fieldMeta }" :name="resolvedVeeName" :rules="fieldRules">
    <Transition
      enter-active-class="transition-all duration-300 ease-out"
      leave-active-class="transition-all duration-200 ease-in"
      enter-from-class="opacity-0 -translate-y-2"
      enter-to-class="opacity-100 translate-y-0"
      leave-from-class="opacity-100 translate-y-0"
      leave-to-class="opacity-0 -translate-y-2"
    >
      <div v-if="isVisible">
        <FormFieldText
          v-if="meta.type === 'text'"
          :field="field"
          :errors="fieldMeta.touched ? errors : []"
          :meta="meta"
          :name="name"
          :on-change="handleFieldChange"
        />
        <FormFieldTextarea
          v-else-if="meta.type === 'textarea'"
          :field="field"
          :errors="fieldMeta.touched ? errors : []"
          :meta="meta"
          :name="name"
          :on-change="handleFieldChange"
        />
        <FormFieldNumber
          v-else-if="meta.type === 'number'"
          :field="field"
          :errors="fieldMeta.touched ? errors : []"
          :meta="meta"
          :name="name"
          :on-change="handleFieldChange"
        />
        <FormFieldToggle
          v-else-if="meta.type === 'toggle'"
          :field="field"
          :errors="fieldMeta.touched ? errors : []"
          :meta="meta"
          :name="name"
          :on-change="handleFieldChange"
        />
        <FormFieldSelect
          v-else-if="meta.type === 'select'"
          :field="field"
          :errors="fieldMeta.touched ? errors : []"
          :meta="meta"
          :name="name"
          :on-change="handleFieldChange"
        />
        <FormFieldCombobox
          v-else-if="meta.type === 'combobox'"
          :field="field"
          :errors="fieldMeta.touched ? errors : []"
          :meta="meta"
          :name="name"
          :on-change="handleFieldChange"
        />
        <FormFieldAutocomplete
          v-else-if="meta.type === 'autocomplete'"
          :field="field"
          :errors="fieldMeta.touched ? errors : []"
          :meta="meta"
          :name="name"
          :field-prefix="fieldPrefix"
          :on-change="handleFieldChange"
        />
        <FormFieldRadioGroup
          v-else-if="meta.type === 'radio-group'"
          :field="field"
          :errors="fieldMeta.touched ? errors : []"
          :meta="meta"
          :name="name"
          :on-change="handleFieldChange"
        />
        <FormFieldEmoji
          v-else-if="meta.type === 'emoji'"
          :field="field"
          :errors="fieldMeta.touched ? errors : []"
          :meta="meta"
          :name="name"
          :on-change="handleFieldChange"
        />
        <FormFieldSlider
          v-else-if="meta.type === 'slider'"
          :field="field"
          :errors="fieldMeta.touched ? errors : []"
          :meta="meta"
          :name="name"
          :on-change="handleFieldChange"
        />
        <FormFieldCard v-else-if="meta.type === 'card'" :meta="meta" />
        <FormFieldSeparator v-else-if="meta.type === 'separator'" :meta="meta" />
        <FormFieldGroup
          v-else-if="meta.type === 'field-group'"
          :field="field"
          :errors="fieldMeta.touched ? errors : []"
          :meta="meta"
          :name="name"
          :on-change="handleFieldChange"
        />
        <FormFieldArray
          v-else-if="meta.type === 'array'"
          :field="field"
          :errors="fieldMeta.touched ? errors : []"
          :meta="meta"
          :name="name"
          :on-change="handleFieldChange"
        />
        <FormFieldTabs
          v-else-if="meta.type === 'tabs'"
          :field="field"
          :errors="fieldMeta.touched ? errors : []"
          :meta="meta"
          :name="name"
          :on-change="handleFieldChange"
        />
        <div v-else class="text-destructive text-sm">
          Unknown field type: {{ (meta as { type: string }).type }}
        </div>
      </div>
    </Transition>
  </VeeField>
</template>
