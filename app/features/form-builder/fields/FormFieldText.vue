<script setup lang="ts">
import { inject, computed } from 'vue'
import { Input } from '@/components/ui/input'
import { Field, FieldLabel, FieldError } from '@/components/ui/field'
import type { TextFieldMeta, VeeFieldContext } from '~/features/form-builder/form-builder-types'

interface Props {
  field: VeeFieldContext
  errors: string[]
  meta: TextFieldMeta
  name: string
  onFieldChange?: (value: unknown, fieldOnChange: (value: unknown) => void) => void
}

const props = defineProps<Props>()

const submitForm = inject<() => void>('submitForm', () => {})

const inputValue = computed(() => props.field.value as string | number | undefined)

const handleEnterKey = (event: KeyboardEvent) => {
  event.preventDefault()
  submitForm()
}
</script>

<template>
  <Field :data-invalid="!!errors.length">
    <FieldLabel v-if="meta.label" :for="name" :class="meta.labelClass">
      {{ meta.label }}
      <span v-if="meta.optional" class="text-muted-foreground font-normal">(optional)</span>
    </FieldLabel>
    <Input
      :id="name"
      :model-value="inputValue"
      :placeholder="meta.placeholder"
      :autocomplete="meta.autocomplete"
      :aria-invalid="!!errors.length"
      :class="[meta.class, 'text-sm']"
      @update:model-value="
        (value) => (onFieldChange ? onFieldChange(value, field.onChange) : field.onChange(value))
      "
      @blur="field.onBlur"
      @keydown.enter="handleEnterKey"
    />
    <FieldError v-if="errors.length" :errors="errors.slice(0, 1)" />
  </Field>
</template>
