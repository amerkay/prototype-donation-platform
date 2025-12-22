<script setup lang="ts">
import { computed, inject, defineAsyncComponent, type ComputedRef } from 'vue'
import { Field as VeeField } from 'vee-validate'
import { toTypedSchema } from '@vee-validate/zod'
import * as z from 'zod'
import type { FieldMeta, SetFieldValueFn } from '~/features/form-builder/form-builder-types'
import { resolveVeeFieldPath } from '~/features/form-builder/field-path-utils'
import { useFormBuilderContext } from '~/features/form-builder/composables/useFormBuilderContext'
import { cn } from '@/lib/utils'

// Async component imports for code splitting
const FormFieldText = defineAsyncComponent(() => import('./fields/FormFieldText.vue'))
const FormFieldTextarea = defineAsyncComponent(() => import('./fields/FormFieldTextarea.vue'))
const FormFieldNumber = defineAsyncComponent(() => import('./fields/FormFieldNumber.vue'))
const FormFieldCurrency = defineAsyncComponent(() => import('./fields/FormFieldCurrency.vue'))
const FormFieldToggle = defineAsyncComponent(() => import('./fields/FormFieldToggle.vue'))
const FormFieldSelect = defineAsyncComponent(() => import('./fields/FormFieldSelect.vue'))
const FormFieldCombobox = defineAsyncComponent(() => import('./fields/FormFieldCombobox.vue'))
const FormFieldAutocomplete = defineAsyncComponent(
  () => import('./fields/FormFieldAutocomplete.vue')
)
const FormFieldRadioGroup = defineAsyncComponent(() => import('./fields/FormFieldRadioGroup.vue'))
const FormFieldEmoji = defineAsyncComponent(() => import('./fields/FormFieldEmoji.vue'))
const FormFieldSlider = defineAsyncComponent(() => import('./fields/FormFieldSlider.vue'))
const FormFieldCard = defineAsyncComponent(() => import('./fields/FormFieldCard.vue'))
const FormFieldSeparator = defineAsyncComponent(() => import('./fields/FormFieldSeparator.vue'))
const FormFieldGroup = defineAsyncComponent(() => import('./fields/FormFieldGroup.vue'))
const FormFieldArray = defineAsyncComponent(() => import('./fields/FormFieldArray.vue'))
const FormFieldTabs = defineAsyncComponent(() => import('./fields/FormFieldTabs.vue'))

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
      v-show="isVisible"
      enter-active-class="transition-all duration-300 ease-out"
      leave-active-class="transition-all duration-200 ease-in"
      enter-from-class="opacity-0 -translate-y-2"
      enter-to-class="opacity-100 translate-y-0"
      leave-from-class="opacity-100 translate-y-0"
      leave-to-class="opacity-0 -translate-y-2"
    >
      <FormFieldText
        v-if="meta.type === 'text'"
        :field="field"
        :errors="fieldMeta.touched ? errors : []"
        :meta="meta"
        :name="name"
        :class="cn(props.class)"
        :on-change="handleFieldChange"
      />
      <FormFieldTextarea
        v-else-if="meta.type === 'textarea'"
        :field="field"
        :errors="fieldMeta.touched ? errors : []"
        :meta="meta"
        :name="name"
        :class="cn(props.class)"
        :on-change="handleFieldChange"
      />
      <FormFieldNumber
        v-else-if="meta.type === 'number'"
        :field="field"
        :errors="fieldMeta.touched || isInsideArray ? errors : []"
        :meta="meta"
        :name="name"
        :class="cn(props.class)"
        :on-change="handleFieldChange"
      />
      <FormFieldCurrency
        v-else-if="meta.type === 'currency'"
        :field="field"
        :errors="fieldMeta.touched || isInsideArray ? errors : []"
        :meta="meta"
        :name="name"
        :class="cn(props.class)"
        :on-change="handleFieldChange"
      />
      <FormFieldToggle
        v-else-if="meta.type === 'toggle'"
        :field="field"
        :errors="fieldMeta.touched ? errors : []"
        :meta="meta"
        :name="name"
        :class="cn(props.class)"
        :on-change="handleFieldChange"
      />
      <FormFieldSelect
        v-else-if="meta.type === 'select'"
        :field="field"
        :errors="fieldMeta.touched ? errors : []"
        :meta="meta"
        :name="name"
        :class="cn(props.class)"
        :on-change="handleFieldChange"
      />
      <FormFieldCombobox
        v-else-if="meta.type === 'combobox'"
        :field="field"
        :errors="fieldMeta.touched ? errors : []"
        :meta="meta"
        :name="name"
        :class="cn(props.class)"
        :on-change="handleFieldChange"
      />
      <FormFieldAutocomplete
        v-else-if="meta.type === 'autocomplete'"
        :field="field"
        :errors="fieldMeta.touched ? errors : []"
        :meta="meta"
        :name="name"
        :field-prefix="fieldPrefix"
        :class="cn(props.class)"
        :on-change="handleFieldChange"
      />
      <FormFieldRadioGroup
        v-else-if="meta.type === 'radio-group'"
        :field="field"
        :errors="fieldMeta.touched ? errors : []"
        :meta="meta"
        :name="name"
        :class="cn(props.class)"
        :on-change="handleFieldChange"
      />
      <FormFieldEmoji
        v-else-if="meta.type === 'emoji'"
        :field="field"
        :errors="fieldMeta.touched ? errors : []"
        :meta="meta"
        :name="name"
        :class="cn(props.class)"
        :on-change="handleFieldChange"
      />
      <FormFieldSlider
        v-else-if="meta.type === 'slider'"
        :field="field"
        :errors="fieldMeta.touched ? errors : []"
        :meta="meta"
        :name="name"
        :class="cn(props.class)"
        :on-change="handleFieldChange"
      />
      <FormFieldCard v-else-if="meta.type === 'card'" :meta="meta" :class="cn(props.class)" />
      <FormFieldSeparator
        v-else-if="meta.type === 'separator'"
        :meta="meta"
        :class="cn(props.class)"
      />
      <FormFieldGroup
        v-else-if="meta.type === 'field-group'"
        :meta="meta"
        :name="name"
        :class="cn(props.class)"
      />
      <FormFieldArray
        v-else-if="meta.type === 'array'"
        :field="field"
        :errors="errors"
        :meta="meta"
        :name="name"
        :touched="fieldMeta.touched"
        :class="cn(props.class)"
        :on-change="handleFieldChange"
      />
      <FormFieldTabs
        v-else-if="meta.type === 'tabs'"
        :meta="meta"
        :name="name"
        :class="cn(props.class)"
      />
      <div v-else class="text-destructive text-sm">
        Unknown field type: {{ (meta as { type: string }).type }}
      </div>
    </Transition>
  </VeeField>
</template>
