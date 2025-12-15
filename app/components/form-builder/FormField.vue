<script setup lang="ts">
import { computed, inject, watch } from 'vue'
import { Field as VeeField, useField } from 'vee-validate'
import { toTypedSchema } from '@vee-validate/zod'
import * as z from 'zod'
import type { FieldMeta } from '@/lib/form-builder/types'
import FormFieldText from './fields/FormFieldText.vue'
import FormFieldTextarea from './fields/FormFieldTextarea.vue'
import FormFieldNumber from './fields/FormFieldNumber.vue'
import FormFieldToggle from './fields/FormFieldToggle.vue'
import FormFieldSelect from './fields/FormFieldSelect.vue'
import FormFieldRadioGroup from './fields/FormFieldRadioGroup.vue'
import FormFieldObject from './fields/FormFieldObject.vue'

interface Props {
  name: string
  meta: FieldMeta
}

const props = defineProps<Props>()

// Inject form values for conditional visibility
const formValues = inject<() => Record<string, unknown>>('formValues', () => ({}))

// Check if field should be visible
const isVisible = computed(() => {
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
const { resetField } = useField(props.name, fieldRules, {
  syncVModel: false
})

// Clear errors when field becomes hidden
watch(isVisible, (visible) => {
  if (!visible) {
    // Reset validation state when hidden
    resetField({ value: undefined })
  }
})
</script>

<template>
  <VeeField v-slot="{ field, errors, meta: fieldMeta }" :name="name" :rules="fieldRules">
    <template v-if="!isVisible">
      <!-- Field is registered but renders nothing when hidden -->
    </template>
    <FormFieldText
      v-else-if="meta.type === 'text'"
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
    <FormFieldObject
      v-else-if="meta.type === 'object'"
      :field="field"
      :errors="fieldMeta.touched ? errors : []"
      :meta="meta"
      :name="name"
    />
    <div v-else class="text-destructive text-sm">Unknown field type: {{ meta.type }}</div>
  </VeeField>
</template>
