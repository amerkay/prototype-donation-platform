<script setup lang="ts">
import { computed, inject } from 'vue'
import { Field as VeeField, useField } from 'vee-validate'
import { toTypedSchema } from '@vee-validate/zod'
import * as z from 'zod'
import type { FieldMeta } from '~/features/form-builder/form-builder-types'
import FormFieldText from './fields/FormFieldText.vue'
import FormFieldTextarea from './fields/FormFieldTextarea.vue'
import FormFieldNumber from './fields/FormFieldNumber.vue'
import FormFieldToggle from './fields/FormFieldToggle.vue'
import FormFieldSelect from './fields/FormFieldSelect.vue'
import FormFieldRadioGroup from './fields/FormFieldRadioGroup.vue'
import FormFieldEmoji from './fields/FormFieldEmoji.vue'
import FormFieldGroup from './fields/FormFieldGroup.vue'

interface Props {
  name: string
  meta: FieldMeta
}

const props = defineProps<Props>()

// Inject form values for conditional visibility
const formValues = inject<() => Record<string, unknown>>('formValues', () => ({}))

// Inject parent group visibility (if this field is inside a field-group)
const parentGroupVisible = inject<() => boolean>('parentGroupVisible', () => true)

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
  const rules =
    typeof props.meta.rules === 'function' ? props.meta.rules(formValues()) : props.meta.rules

  return toTypedSchema(rules)
})

// Use useField to get direct access to field state
useField(props.name, fieldRules, {
  syncVModel: false,
  // Keep field value even when component unmounts (accordion closes)
  keepValueOnUnmount: true
})

// Note: We don't reset field values when they become hidden
// This preserves user input when toggling visibility on/off
</script>

<template>
  <VeeField v-slot="{ field, errors, meta: fieldMeta }" :name="name" :rules="fieldRules">
    <div v-show="isVisible">
      <FormFieldText
        v-if="meta.type === 'text'"
        :field="field"
        :errors="fieldMeta.touched ? errors : []"
        :meta="meta"
        :name="name"
      />
      <FormFieldTextarea
        v-else-if="meta.type === 'textarea'"
        :field="field"
        :errors="fieldMeta.touched ? errors : []"
        :meta="meta"
        :name="name"
      />
      <FormFieldNumber
        v-else-if="meta.type === 'number'"
        :field="field"
        :errors="fieldMeta.touched ? errors : []"
        :meta="meta"
        :name="name"
      />
      <FormFieldToggle
        v-else-if="meta.type === 'toggle'"
        :field="field"
        :errors="fieldMeta.touched ? errors : []"
        :meta="meta"
        :name="name"
      />
      <FormFieldSelect
        v-else-if="meta.type === 'select'"
        :field="field"
        :errors="fieldMeta.touched ? errors : []"
        :meta="meta"
        :name="name"
      />
      <FormFieldRadioGroup
        v-else-if="meta.type === 'radio-group'"
        :field="field"
        :errors="fieldMeta.touched ? errors : []"
        :meta="meta"
        :name="name"
      />
      <FormFieldEmoji
        v-else-if="meta.type === 'emoji'"
        :field="field"
        :errors="fieldMeta.touched ? errors : []"
        :meta="meta"
        :name="name"
      />
      <FormFieldGroup
        v-else-if="meta.type === 'field-group'"
        :field="field"
        :errors="meta.rules && errors.length > 0 ? errors : fieldMeta.touched ? errors : []"
        :meta="meta"
        :name="name"
      />
      <div v-else class="text-destructive text-sm">Unknown field type: {{ meta.type }}</div>
    </div>
  </VeeField>
</template>
