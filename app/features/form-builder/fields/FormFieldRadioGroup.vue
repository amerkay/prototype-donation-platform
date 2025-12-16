<script setup lang="ts">
import { computed } from 'vue'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import {
  FieldSet,
  FieldLegend,
  FieldDescription,
  FieldLabel,
  FieldError,
  Field,
  FieldContent,
  FieldTitle
} from '@/components/ui/field'
import type {
  RadioGroupFieldMeta,
  VeeFieldContext
} from '~/features/form-builder/form-builder-types'

interface Props {
  field: VeeFieldContext
  errors: string[]
  meta: RadioGroupFieldMeta
  name: string
  onFieldChange?: (value: unknown, fieldOnChange: (value: unknown) => void) => void
}

const props = defineProps<Props>()

const fieldValue = computed(() => props.field.value as string | number | undefined)
</script>

<template>
  <FieldSet :data-invalid="!!errors.length">
    <FieldLegend v-if="meta.label" :class="meta.labelClass">{{ meta.label }}</FieldLegend>
    <FieldDescription v-if="meta.description">{{ meta.description }}</FieldDescription>
    <RadioGroup
      :name="field.name"
      :model-value="fieldValue"
      :aria-invalid="!!errors.length"
      :class="[meta.class, 'gap-4']"
      @update:model-value="
        (value) => (onFieldChange ? onFieldChange(value, field.onChange) : field.onChange(value))
      "
    >
      <FieldLabel
        v-for="option in meta.options"
        :key="option.value"
        :for="`${name}-${option.value}`"
      >
        <Field orientation="horizontal" :data-invalid="!!errors.length">
          <FieldContent>
            <FieldTitle>{{ option.label }}</FieldTitle>
            <FieldDescription v-if="option.description">{{ option.description }}</FieldDescription>
          </FieldContent>
          <RadioGroupItem
            :id="`${name}-${option.value}`"
            :value="String(option.value)"
            :aria-invalid="!!errors.length"
          />
        </Field>
      </FieldLabel>
    </RadioGroup>
    <FieldError v-if="errors.length" :errors="errors.slice(0, 1)" />
  </FieldSet>
</template>
