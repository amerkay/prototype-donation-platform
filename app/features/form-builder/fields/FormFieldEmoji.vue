<script setup lang="ts">
import { inject, computed } from 'vue'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import type { EmojiFieldMeta, VeeFieldContext } from '~/features/form-builder/form-builder-types'
import { useResolvedFieldMeta } from '~/features/form-builder/composables/useResolvedFieldMeta'
import { useFieldChange } from '~/features/form-builder/composables/useFieldChange'
import FormFieldWrapper from '~/features/form-builder/components/FormFieldWrapper.vue'

interface Props {
  field: VeeFieldContext
  errors: string[]
  meta: EmojiFieldMeta
  name: string
  onFieldChange?: (value: unknown, fieldOnChange: (value: unknown) => void) => void
}

const props = defineProps<Props>()

const submitForm = inject<() => void>('submitForm', () => {})

const { resolvedLabel, resolvedDescription, resolvedPlaceholder } = useResolvedFieldMeta(props.meta)
const { handleChange } = useFieldChange(props.field, props.onFieldChange)

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
    handleChange(truncated)
  }
}

const handleEnterKey = (event: KeyboardEvent) => {
  event.preventDefault()
  submitForm()
}
</script>

<template>
  <FormFieldWrapper
    :name="name"
    :label="resolvedLabel"
    :description="resolvedDescription"
    :optional="meta.optional"
    :errors="errors"
    :invalid="!!errors.length"
    :label-class="meta.labelClass"
    :description-class="meta.descriptionClass"
  >
    <Input
      :id="name"
      :model-value="inputValue"
      :placeholder="resolvedPlaceholder"
      :aria-invalid="!!errors.length"
      :class="cn(meta.class, 'text-2xl text-center')"
      :maxlength="maxLength"
      @update:model-value="handleInput"
      @blur="field.onBlur"
      @keydown.enter="handleEnterKey"
    />
  </FormFieldWrapper>
</template>
