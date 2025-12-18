<script setup lang="ts">
import { computed, inject } from 'vue'
import { NativeSelect, NativeSelectOption } from '@/components/ui/native-select'
import { Field, FieldLabel, FieldError } from '@/components/ui/field'
import type { SelectFieldMeta, VeeFieldContext } from '~/features/form-builder/form-builder-types'

interface Props {
  field: VeeFieldContext
  errors: string[]
  meta: SelectFieldMeta
  name: string
  onFieldChange?: (value: unknown, fieldOnChange: (value: unknown) => void) => void
}

const props = defineProps<Props>()

const formValues = inject<() => Record<string, unknown>>('formValues', () => ({}))

const resolvedLabel = computed(() => {
  if (!props.meta.label) return undefined
  if (typeof props.meta.label === 'function') {
    return props.meta.label(formValues())
  }
  return props.meta.label
})

const selectValue = computed({
  get: () => props.field.value as string | number | undefined,
  set: (value) => {
    // Find the original option to preserve correct type
    const option = props.meta.options.find((o) => String(o.value) === String(value))
    if (option) {
      if (props.onFieldChange) {
        props.onFieldChange(option.value, props.field.onChange)
      } else {
        props.field.onChange(option.value)
      }
    }
  }
})
</script>

<template>
  <Field :data-invalid="!!errors.length">
    <FieldLabel v-if="resolvedLabel" :for="name" :class="meta.labelClass">
      {{ resolvedLabel }}
      <span v-if="meta.optional" class="text-muted-foreground font-normal">(optional)</span>
    </FieldLabel>
    <NativeSelect
      :id="name"
      v-model="selectValue"
      :autocomplete="meta.autocomplete"
      :aria-invalid="!!errors.length"
      :disabled="meta.disabled"
      :class="meta.class"
      @blur="field.onBlur"
    >
      <NativeSelectOption v-if="meta.placeholder" value="">
        {{ meta.placeholder }}
      </NativeSelectOption>
      <NativeSelectOption
        v-for="option in meta.options"
        :key="option.value"
        :value="String(option.value)"
      >
        {{ option.label }}
      </NativeSelectOption>
    </NativeSelect>
    <FieldError v-if="errors.length" :errors="errors.slice(0, 1)" />
  </Field>
</template>
