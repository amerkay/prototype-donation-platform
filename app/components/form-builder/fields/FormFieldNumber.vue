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
import type { NumberFieldMeta } from '~/components/form-builder/form-builder-types'
import type { VeeFieldContext } from '~/components/form-builder/form-builder-types'

interface Props {
  field: VeeFieldContext
  errors: string[]
  meta: NumberFieldMeta
  name: string
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
    <FieldLabel v-if="meta.label" :for="name">
      {{ meta.label }}
      <span v-if="meta.optional" class="text-muted-foreground font-normal">(optional)</span>
    </FieldLabel>
    <FieldDescription v-if="meta.description">{{ meta.description }}</FieldDescription>
    <NumberField
      :id="name"
      :model-value="numberValue"
      :min="meta.min"
      :max="meta.max"
      :step="meta.step"
      @update:model-value="field.onChange"
    >
      <NumberFieldContent>
        <NumberFieldDecrement />
        <NumberFieldInput :aria-invalid="!!errors.length" @keydown.enter="handleEnterKey" />
        <NumberFieldIncrement />
      </NumberFieldContent>
    </NumberField>
    <FieldError v-if="errors.length" :errors="errors" />
  </Field>
</template>
