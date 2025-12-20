<script setup lang="ts">
import { inject, computed } from 'vue'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import type { TextFieldMeta, VeeFieldContext } from '~/features/form-builder/form-builder-types'
import { useResolvedFieldMeta } from '~/features/form-builder/composables/useResolvedFieldMeta'
import { useFieldChange } from '~/features/form-builder/composables/useFieldChange'
import FormFieldWrapper from '~/features/form-builder/components/FormFieldWrapper.vue'

interface Props {
  field: VeeFieldContext
  errors: string[]
  meta: TextFieldMeta
  name: string
  onFieldChange?: (value: unknown, fieldOnChange: (value: unknown) => void) => void
}

const props = defineProps<Props>()

const submitForm = inject<() => void>('submitForm', () => {})
const inputValue = computed(() => props.field.value as string | number | undefined)

const { resolvedLabel, resolvedPlaceholder } = useResolvedFieldMeta(props.meta)
const { handleChange } = useFieldChange(props.field, props.onFieldChange)

const handleEnterKey = (event: KeyboardEvent) => {
  event.preventDefault()
  submitForm()
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
      :model-value="inputValue"
      :placeholder="resolvedPlaceholder"
      :autocomplete="meta.autocomplete"
      :aria-invalid="!!errors.length"
      :class="cn(meta.class, 'text-sm')"
      @update:model-value="handleChange"
      @blur="field.onBlur"
      @keydown.enter="handleEnterKey"
    />
  </FormFieldWrapper>
</template>
