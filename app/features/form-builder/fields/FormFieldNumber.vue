<script setup lang="ts">
import {
  NumberField,
  NumberFieldContent,
  NumberFieldDecrement,
  NumberFieldIncrement,
  NumberFieldInput
} from '@/components/ui/number-field'
import type { NumberFieldMeta } from '~/features/form-builder/form-builder-types'
import {
  useFieldWrapper,
  preventEnterSubmit
} from '~/features/form-builder/composables/useFieldWrapper'
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

const { wrapperProps } = useFieldWrapper(props.meta, props.name, () => props.errors)

const handleChange = (value: number | null | undefined) => {
  emit('update:modelValue', value)
}
</script>

<template>
  <FormFieldWrapper v-bind="wrapperProps">
    <NumberField
      :id="name"
      :model-value="modelValue"
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
          @keydown.enter="preventEnterSubmit"
        />
        <NumberFieldIncrement />
      </NumberFieldContent>
    </NumberField>
  </FormFieldWrapper>
</template>
