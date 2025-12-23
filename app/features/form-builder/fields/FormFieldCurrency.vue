<script setup lang="ts">
import { computed, type HTMLAttributes } from 'vue'

import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
  InputGroupText
} from '@/components/ui/input-group'
import type { CurrencyFieldMeta, VeeFieldContext } from '~/features/form-builder/form-builder-types'
import { useFormBuilderContext } from '~/features/form-builder/composables/useFormBuilderContext'
import { useResolvedFieldMeta } from '~/features/form-builder/composables/useResolvedFieldMeta'
import FormFieldWrapper from '~/features/form-builder/components/FormFieldWrapper.vue'
import { cn } from '@/lib/utils'

interface Props {
  field: VeeFieldContext
  errors: string[]
  meta: CurrencyFieldMeta
  name: string
  onChange?: (value: unknown) => void
  class?: HTMLAttributes['class']
}

const props = defineProps<Props>()

// Get form values for dynamic currencySymbol resolution
const { formValues } = useFormBuilderContext()

const handleEnterKey = (event: KeyboardEvent) => {
  event.preventDefault()
}

const modelValue = computed(() => props.field.value as number | string | null | undefined)

const { resolvedLabel, resolvedDescription } = useResolvedFieldMeta(props.meta)

// Resolve currency symbol dynamically
const currencySymbol = computed(() => {
  if (typeof props.meta.currencySymbol === 'function') {
    return props.meta.currencySymbol(formValues.value)
  }
  return props.meta.currencySymbol
})

const handleUpdate = (value: string | number) => {
  // Convert to number if valid, otherwise keep as string for validation
  let convertedValue: number | string = value
  if (value !== '' && !isNaN(Number(value))) {
    convertedValue = Number(value)
  }

  props.field.onChange(convertedValue)
  props.onChange?.(convertedValue)
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
    <InputGroup :class="cn(props.class, meta.class)">
      <InputGroupAddon>
        <InputGroupText>{{ currencySymbol }}</InputGroupText>
      </InputGroupAddon>
      <InputGroupInput
        :id="name"
        type="number"
        :model-value="modelValue"
        :min="meta.min"
        :max="meta.max"
        :step="meta.step ?? 1"
        :placeholder="meta.placeholder"
        :disabled="meta.disabled"
        :aria-invalid="!!errors.length"
        :class="meta.class"
        @update:model-value="handleUpdate"
        @keydown.enter="handleEnterKey"
      />
    </InputGroup>
  </FormFieldWrapper>
</template>
