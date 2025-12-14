<script setup lang="ts">
import {
  NumberField,
  NumberFieldContent,
  NumberFieldDecrement,
  NumberFieldIncrement,
  NumberFieldInput
} from '@/components/ui/number-field'
import { Field, FieldLabel, FieldError, FieldDescription } from '@/components/ui/field'
import type { NumberFieldMeta } from '@/lib/form-builder/types'
import type { VeeFieldContext } from '@/lib/form-builder/field-types'

interface Props {
  field: VeeFieldContext
  errors: string[]
  meta: NumberFieldMeta
  name: string
}

defineProps<Props>()
</script>

<template>
  <Field :data-invalid="!!errors.length">
    <FieldLabel v-if="meta.label" :for="name">
      {{ meta.label }}
      <span v-if="meta.optional" class="text-muted-foreground font-normal">(optional)</span>
    </FieldLabel>
    <FieldDescription v-if="meta.description">{{ meta.description }}</FieldDescription>
    <NumberField
      :id="name"
      :model-value="field.value"
      :min="meta.min"
      :max="meta.max"
      :step="meta.step"
      @update:model-value="field.onChange"
    >
      <NumberFieldContent>
        <NumberFieldDecrement />
        <NumberFieldInput :aria-invalid="!!errors.length" />
        <NumberFieldIncrement />
      </NumberFieldContent>
    </NumberField>
    <FieldError v-if="errors.length" :errors="errors" />
  </Field>
</template>
