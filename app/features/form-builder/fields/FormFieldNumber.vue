<script setup lang="ts">
import { inject, computed } from 'vue'
import {
  NumberField,
  NumberFieldContent,
  NumberFieldDecrement,
  NumberFieldIncrement,
  NumberFieldInput
} from '@/components/ui/number-field'
import { Field, FieldLabel, FieldError, FieldDescription } from '@/components/ui/field'
import type { NumberFieldMeta, VeeFieldContext } from '~/features/form-builder/form-builder-types'

interface Props {
  field: VeeFieldContext
  errors: string[]
  meta: NumberFieldMeta
  name: string
  onFieldChange?: (value: unknown, fieldOnChange: (value: unknown) => void) => void
}

const props = defineProps<Props>()

const submitForm = inject<() => void>('submitForm', () => {})

const handleEnterKey = (event: KeyboardEvent) => {
  event.preventDefault()
  submitForm()
}

const numberValue = computed(() => props.field.value as number | null | undefined)
</script>

<template>
  <Field :data-invalid="!!errors.length">
    <FieldLabel v-if="meta.label" :for="name" :class="meta.labelClass">
      {{ meta.label }}
      <span v-if="meta.optional" class="text-muted-foreground font-normal">(optional)</span>
    </FieldLabel>
    <FieldDescription v-if="meta.description" :class="meta.descriptionClass">{{
      meta.description
    }}</FieldDescription>
    <NumberField
      :id="name"
      :model-value="numberValue"
      :min="meta.min"
      :max="meta.max"
      :step="meta.step"
      @update:model-value="
        (value) => (onFieldChange ? onFieldChange(value, field.onChange) : field.onChange(value))
      "
    >
      <NumberFieldContent>
        <NumberFieldDecrement />
        <NumberFieldInput
          :aria-invalid="!!errors.length"
          :class="meta.class"
          @keydown.enter="handleEnterKey"
        />
        <NumberFieldIncrement />
      </NumberFieldContent>
    </NumberField>
    <FieldError v-if="errors.length" :errors="errors.slice(0, 1)" />
  </Field>
</template>
