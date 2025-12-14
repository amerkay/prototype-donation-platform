<script setup lang="ts">
import { Input } from '@/components/ui/input'
import { Field, FieldLabel, FieldError } from '@/components/ui/field'
import type { TextFieldMeta } from '@/lib/form-builder/types'
import type { VeeFieldContext } from '@/lib/form-builder/field-types'

interface Props {
  field: VeeFieldContext
  errors: string[]
  meta: TextFieldMeta
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
    <Input
      :id="name"
      :model-value="field.value"
      :placeholder="meta.placeholder"
      :aria-invalid="!!errors.length"
      @update:model-value="field.onChange"
      @blur="field.onBlur"
    />
    <FieldError v-if="errors.length" :errors="errors" />
  </Field>
</template>
