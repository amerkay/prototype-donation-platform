<script setup lang="ts">
import { computed } from 'vue'
import { Textarea } from '@/components/ui/textarea'
import { Field, FieldLabel, FieldError } from '@/components/ui/field'
import type { TextareaFieldMeta, VeeFieldContext } from '~/features/form-builder/form-builder-types'

interface Props {
  field: VeeFieldContext
  errors: string[]
  meta: TextareaFieldMeta
  name: string
  onFieldChange?: (value: unknown, fieldOnChange: (value: unknown) => void) => void
}

const props = defineProps<Props>()

const textareaValue = computed(() => props.field.value as string | number | undefined)
</script>

<template>
  <Field :data-invalid="!!errors.length">
    <FieldLabel v-if="meta.label" :for="name" :class="meta.labelClass">
      {{ meta.label }}
      <span v-if="meta.optional" class="text-muted-foreground font-normal">(optional)</span>
    </FieldLabel>
    <Textarea
      :id="name"
      :model-value="textareaValue"
      :placeholder="meta.placeholder"
      :rows="meta.rows"
      :maxlength="meta.maxLength"
      :aria-invalid="!!errors.length"
      :class="meta.class"
      @update:model-value="
        (value) => (onFieldChange ? onFieldChange(value, field.onChange) : field.onChange(value))
      "
      @blur="field.onBlur"
    />
    <FieldError v-if="errors.length" :errors="errors.slice(0, 1)" />
  </Field>
</template>
