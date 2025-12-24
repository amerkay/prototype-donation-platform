<script setup lang="ts">
import {
  NumberField,
  NumberFieldContent,
  NumberFieldDecrement,
  NumberFieldIncrement,
  NumberFieldInput
} from '@/components/ui/number-field'
import type { NumberFieldMeta } from '~/features/form-builder/form-builder-types'
import { useResolvedFieldMeta } from '~/features/form-builder/composables/useResolvedFieldMeta'
import FormFieldWrapper from '~/features/form-builder/components/FormFieldWrapper.vue'

interface Props {
  modelValue?: number | null
  errors: string[]
  meta: NumberFieldMeta
  name: string
  onBlur?: (e?: Event) => void
}

const props = defineProps<Props>()
const emit = defineEmits<{
  'update:modelValue': [value: number | null | undefined]
}>()

const handleEnterKey = (event: KeyboardEvent) => {
  event.preventDefault()
}

const { resolvedLabel, resolvedDescription } = useResolvedFieldMeta(props.meta)

const handleChange = (value: number | null | undefined) => {
  emit('update:modelValue', value)
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
