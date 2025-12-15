<script setup lang="ts">
import { computed } from 'vue'
import { Textarea } from '@/components/ui/textarea'
import { Field, FieldLabel, FieldError } from '@/components/ui/field'
import type { TextareaFieldMeta } from '@/lib/form-builder/types'
import type { VeeFieldContext } from '@/lib/form-builder/field-types'

interface Props {
  field: VeeFieldContext
  errors: string[]
  meta: TextareaFieldMeta
  name: string
}

const props = defineProps<Props>()

const textareaValue = computed(() => props.field.value as string | number | undefined)
</script>

<template>
  <Field :data-invalid="!!errors.length">
    <FieldLabel v-if="meta.label" :for="name">
      {{ meta.label }}
      <span v-if="meta.optional" class="text-muted-foreground font-normal">(optional)</span>
    </FieldLabel>
    <Textarea
      :id="name"
      :model-value="textareaValue"
      :placeholder="meta.placeholder"
      :rows="meta.rows"
      :aria-invalid="!!errors.length"
      @update:model-value="field.onChange"
      @blur="field.onBlur"
    />
    <FieldError v-if="errors.length" :errors="errors" />
  </Field>
</template>
