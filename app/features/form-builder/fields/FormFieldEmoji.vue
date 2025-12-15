<script setup lang="ts">
import { inject, computed } from 'vue'
import { Input } from '@/components/ui/input'
import { Field, FieldLabel, FieldError, FieldDescription } from '@/components/ui/field'
import type { EmojiFieldMeta, VeeFieldContext } from '~/features/form-builder/form-builder-types'

interface Props {
  field: VeeFieldContext
  errors: string[]
  meta: EmojiFieldMeta
  name: string
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
    props.field.onChange(truncated)
  }
}

const handleEnterKey = (event: KeyboardEvent) => {
  event.preventDefault()
  submitForm()
}
</script>

<template>
  <Field :data-invalid="!!errors.length">
    <FieldLabel v-if="meta.label" :for="name">
      {{ meta.label }}
      <span v-if="meta.optional" class="text-muted-foreground font-normal">(optional)</span>
    </FieldLabel>
    <FieldDescription v-if="meta.description">{{ meta.description }}</FieldDescription>
    <Input
      :id="name"
      :model-value="inputValue"
      :placeholder="meta.placeholder"
      :aria-invalid="!!errors.length"
      class="text-2xl text-center"
      :maxlength="maxLength"
      @update:model-value="handleInput"
      @blur="field.onBlur"
      @keydown.enter="handleEnterKey"
    />
    <FieldError v-if="errors.length" :errors="errors" />
  </Field>
</template>
