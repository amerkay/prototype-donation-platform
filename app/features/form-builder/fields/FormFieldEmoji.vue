<script setup lang="ts">
import { inject, computed } from 'vue'
import { Input } from '@/components/ui/input'
import { Field, FieldLabel, FieldError, FieldDescription } from '@/components/ui/field'
import { cn } from '@/lib/utils'
import type { EmojiFieldMeta, VeeFieldContext } from '~/features/form-builder/form-builder-types'

interface Props {
  field: VeeFieldContext
  errors: string[]
  meta: EmojiFieldMeta
  name: string
  onFieldChange?: (value: unknown, fieldOnChange: (value: unknown) => void) => void
}

const props = defineProps<Props>()

const submitForm = inject<() => void>('submitForm', () => {})

const inputValue = computed(() => props.field.value as string | undefined)

// Emoji regex pattern - matches most emoji including multi-byte sequences
const EMOJI_REGEX = /^[\p{Emoji}\p{Emoji_Presentation}]+$/u
const maxLength = computed(() => props.meta.maxLength ?? 2)

const handleInput = (value: string | number) => {
  const stringValue = String(value)

  // Only allow emoji characters
  if (stringValue === '' || EMOJI_REGEX.test(stringValue)) {
    // Limit length
    const truncated = stringValue.slice(0, maxLength.value)
    if (props.onFieldChange) {
      props.onFieldChange(truncated, props.field.onChange)
    } else {
      props.field.onChange(truncated)
    }
  }
}

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
    <FieldDescription v-if="meta.description" :class="meta.descriptionClass">{{
      meta.description
    }}</FieldDescription>
    <Input
      :id="name"
      :model-value="inputValue"
      :placeholder="meta.placeholder"
      :aria-invalid="!!errors.length"
      :class="cn(meta.class, 'text-2xl text-center')"
      :maxlength="maxLength"
      @update:model-value="handleInput"
      @blur="field.onBlur"
      @keydown.enter="handleEnterKey"
    />
    <FieldError v-if="errors.length" :errors="errors.slice(0, 1)" />
  </Field>
</template>
