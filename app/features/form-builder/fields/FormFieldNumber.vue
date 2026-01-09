<script setup lang="ts">
import { computed } from 'vue'
import {
  NumberField,
  NumberFieldContent,
  NumberFieldDecrement,
  NumberFieldIncrement,
  NumberFieldInput
} from '@/components/ui/number-field'
import type { NumberFieldMeta, FieldProps, FieldEmits } from '~/features/form-builder/types'
import {
  useFieldWrapper,
  preventEnterSubmit
} from '~/features/form-builder/composables/useFieldWrapper'
import FormFieldWrapper from '~/features/form-builder/internal/FormFieldWrapper.vue'
import { cn } from '@/lib/utils'

type Props = FieldProps<number | null | string, NumberFieldMeta>

const props = defineProps<Props>()
defineEmits<FieldEmits<number | null | string | undefined>>()

const { wrapperProps } = useFieldWrapper(props.meta, props.name, () => props.errors)

// Coerce modelValue to number | null for NumberField component
// Allows invalid string values to flow through form validation while
// preventing Vue prop type warnings from the underlying reka-ui component
const coercedValue = computed<number | null>(() => {
  const val = props.modelValue
  if (val === null || val === undefined || val === '') return null
  if (typeof val === 'number') return val
  // Invalid string: return null to prevent prop warning, validation will catch the error
  const parsed = Number(val)
  return isNaN(parsed) ? null : parsed
})
</script>

<template>
  <FormFieldWrapper v-bind="wrapperProps">
    <NumberField
      :id="id || name"
      :model-value="coercedValue"
      :min="meta.min"
      :max="meta.max"
      :step="meta.step"
      @update:model-value="$emit('update:modelValue', $event)"
    >
      <NumberFieldContent>
        <NumberFieldDecrement />
        <NumberFieldInput
          :aria-invalid="!!errors.length"
          :class="cn('bg-background', meta.class)"
          @keydown.enter="preventEnterSubmit"
        />
        <NumberFieldIncrement />
      </NumberFieldContent>
    </NumberField>
  </FormFieldWrapper>
</template>
