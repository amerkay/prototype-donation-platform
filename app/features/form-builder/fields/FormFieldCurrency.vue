<script setup lang="ts">
import { computed, type HTMLAttributes } from 'vue'

import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
  InputGroupText
} from '@/components/ui/input-group'
import type { CurrencyFieldMeta } from '~/features/form-builder/form-builder-types'
import { useFormBuilderContext } from '~/features/form-builder/composables/useFormBuilderContext'
import {
  useFieldWrapper,
  preventEnterSubmit
} from '~/features/form-builder/composables/useFieldWrapper'
import FormFieldWrapper from '~/features/form-builder/components/FormFieldWrapper.vue'
import { cn } from '@/lib/utils'

interface Props {
  modelValue?: number | string | null
  errors: string[]
  meta: CurrencyFieldMeta
  name: string
  onBlur?: (e?: Event) => void
  class?: HTMLAttributes['class']
}

const props = defineProps<Props>()
const emit = defineEmits<{
  'update:modelValue': [value: number | string]
}>()

// Get form values for dynamic currencySymbol resolution
const { formValues } = useFormBuilderContext()

const { wrapperProps } = useFieldWrapper(props.meta, props.name, () => props.errors)

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

  emit('update:modelValue', convertedValue)
}
</script>

<template>
  <FormFieldWrapper v-bind="wrapperProps">
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
        :aria-invalid="!!errors.length"
        @update:model-value="handleUpdate"
        @blur="onBlur"
        @keydown.enter="preventEnterSubmit"
      />
    </InputGroup>
  </FormFieldWrapper>
</template>
