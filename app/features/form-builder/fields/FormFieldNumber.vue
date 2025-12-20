<script setup lang="ts">
import { inject, computed } from 'vue'
import {
  NumberField,
  NumberFieldContent,
  NumberFieldDecrement,
  NumberFieldIncrement,
  NumberFieldInput
} from '@/components/ui/number-field'
import type { NumberFieldMeta, VeeFieldContext } from '~/features/form-builder/form-builder-types'
import { useResolvedFieldMeta } from '~/features/form-builder/composables/useResolvedFieldMeta'
import FormFieldWrapper from '~/features/form-builder/components/FormFieldWrapper.vue'

interface Props {
  field: VeeFieldContext
  errors: string[]
  meta: NumberFieldMeta
  name: string
  onChange?: (value: unknown) => void
}

const props = defineProps<Props>()

const submitForm = inject<() => void>('submitForm', () => {})

const handleEnterKey = (event: KeyboardEvent) => {
  event.preventDefault()
  submitForm()
}

const numberValue = computed(() => props.field.value as number | null | undefined)

const { resolvedLabel, resolvedDescription } = useResolvedFieldMeta(props.meta)

const handleChange = (value: unknown) => {
  props.field.onChange(value)
  props.onChange?.(value)
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
    <NumberField
      :id="name"
      :model-value="numberValue"
      :min="meta.min"
      :max="meta.max"
      :step="meta.step"
      @update:model-value="handleChange"
    >
      <NumberFieldContent>
        <NumberFieldDecrement />
        <NumberFieldInput
          :aria-invalid="!!errors.length"
          :class="meta.class"
          @keydown.enter="handleEnterKey"
        />
        <NumberFieldIncrement />
      </NumberFieldContent>
    </NumberField>
  </FormFieldWrapper>
</template>
