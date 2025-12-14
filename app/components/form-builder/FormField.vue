<script setup lang="ts">
import { computed, inject } from 'vue'
import { Field as VeeField } from 'vee-validate'
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
</script>

<template>
  <VeeField v-if="isVisible" v-slot="{ field, errors }" :name="name">
    <FormFieldText
      v-if="meta.type === 'text'"
      :field="field"
      :errors="errors"
      :meta="meta"
      :name="name"
    />
    <FormFieldTextarea
      v-else-if="meta.type === 'textarea'"
      :field="field"
      :errors="errors"
      :meta="meta"
      :name="name"
    />
    <FormFieldNumber
      v-else-if="meta.type === 'number'"
      :field="field"
      :errors="errors"
      :meta="meta"
      :name="name"
    />
    <FormFieldToggle
      v-else-if="meta.type === 'toggle'"
      :field="field"
      :errors="errors"
      :meta="meta"
      :name="name"
    />
    <FormFieldSelect
      v-else-if="meta.type === 'select'"
      :field="field"
      :errors="errors"
      :meta="meta"
      :name="name"
    />
    <FormFieldRadioGroup
      v-else-if="meta.type === 'radio-group'"
      :field="field"
      :errors="errors"
      :meta="meta"
      :name="name"
    />
    <FormFieldObject
      v-else-if="meta.type === 'object'"
      :field="field"
      :errors="errors"
      :meta="meta"
      :name="name"
    />
    <div v-else class="text-destructive text-sm">Unknown field type: {{ meta.type }}</div>
  </VeeField>
</template>
