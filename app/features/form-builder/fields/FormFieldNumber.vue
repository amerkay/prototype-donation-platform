<script setup lang="ts">
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

type Props = FieldProps<number | null, NumberFieldMeta>

const props = defineProps<Props>()
defineEmits<FieldEmits<number | null | undefined>>()

const { wrapperProps } = useFieldWrapper(props.meta, props.name, () => props.errors)
</script>

<template>
  <FormFieldWrapper v-bind="wrapperProps">
    <NumberField
      :id="id || name"
      :model-value="modelValue"
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
