<script setup lang="ts">
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import type { TextFieldMeta } from '~/features/form-builder/form-builder-types'
import { useResolvedFieldMeta } from '~/features/form-builder/composables/useResolvedFieldMeta'
import FormFieldWrapper from '~/features/form-builder/components/FormFieldWrapper.vue'

interface Props {
  modelValue?: string | number
  errors: string[]
  meta: TextFieldMeta
  name: string
  onBlur?: (e?: Event) => void
}

const props = defineProps<Props>()
const emit = defineEmits<{
  'update:modelValue': [value: string | number | undefined]
}>()

const { resolvedLabel, resolvedPlaceholder } = useResolvedFieldMeta(props.meta)

const handleChange = (value: string | number | undefined) => {
  emit('update:modelValue', value)
}

const handleEnterKey = (event: KeyboardEvent) => {
  event.preventDefault()
}
</script>

<template>
  <FormFieldWrapper
    :name="name"
    :label="resolvedLabel"
    :optional="meta.optional"
    :errors="errors"
    :invalid="!!errors.length"
    :label-class="meta.labelClass"
  >
    <Input
      :id="name"
      :model-value="modelValue"
      :placeholder="resolvedPlaceholder"
      :autocomplete="meta.autocomplete"
      :aria-invalid="!!errors.length"
      :class="cn(meta.class, 'text-sm')"
      @update:model-value="handleChange"
      @blur="onBlur"
      @keydown.enter="handleEnterKey"
    />
  </FormFieldWrapper>
</template>
