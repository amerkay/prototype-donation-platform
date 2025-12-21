<script setup lang="ts">
import { computed, inject, type ComputedRef } from 'vue'
import { Field as VeeField } from 'vee-validate'
import { toTypedSchema } from '@vee-validate/zod'
import * as z from 'zod'
import type { FieldMeta, SetFieldValueFn } from '~/features/form-builder/form-builder-types'
import { resolveVeeFieldPath } from '~/features/form-builder/field-path-utils'
import { useFormBuilderContext } from '~/features/form-builder/composables/useFormBuilderContext'
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
import { cn } from '@/lib/utils'

interface Props {
  name: string
  meta: FieldMeta
  class?: string
}

const props = defineProps<Props>()

// Inject common form builder context
const { sectionId, fieldPrefix, parentGroupVisible } = useFormBuilderContext()

// Inject form values for conditional visibility (as ComputedRef for reactivity)
const formValues = inject<ComputedRef<Record<string, unknown>>>(
  'formValues',
  computed(() => ({}))
)

// Inject setFieldValue function from FormRenderer
const setFieldValue = inject<SetFieldValueFn>('setFieldValue', () => {})

// Check if this field is inside an array (injected by FormFieldArray)
const isInsideArray = inject<boolean>('isInsideArray', false)

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
  const isTextLikeField = ['text', 'textarea', 'autocomplete', 'select'].includes(props.meta.type)
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

// Handle field changes and call onChange callback if provided
const handleFieldChange = (value: unknown) => {
  if (props.meta.onChange) {
    props.meta.onChange(value, formValues.value, setFieldValue)
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
      <div v-show="isVisible" :class="cn(props.class)">
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
          :errors="fieldMeta.touched || isInsideArray ? errors : []"
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
        <FormFieldGroup v-else-if="meta.type === 'field-group'" :meta="meta" :name="name" />
        <FormFieldArray
          v-else-if="meta.type === 'array'"
          :field="field"
          :errors="errors"
          :meta="meta"
          :name="name"
          :touched="fieldMeta.touched"
          :on-change="handleFieldChange"
        />
        <FormFieldTabs v-else-if="meta.type === 'tabs'" :meta="meta" :name="name" />
        <div v-else class="text-destructive text-sm">
          Unknown field type: {{ (meta as { type: string }).type }}
        </div>
      </div>
    </Transition>
  </VeeField>
</template>
