<script setup lang="ts">
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import type { TextFieldMeta } from '~/features/form-builder/form-builder-types'
import {
  useFieldWrapper,
  preventEnterSubmit
} from '~/features/form-builder/composables/useFieldWrapper'
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

const { wrapperProps, resolvedPlaceholder } = useFieldWrapper(
  props.meta,
  props.name,
  () => props.errors
)

const handleChange = (value: string | number | undefined) => {
  emit('update:modelValue', value)
}
</script>

<template>
  <FormFieldWrapper v-bind="wrapperProps">
    <Input
      :id="name"
      :model-value="modelValue"
      :placeholder="resolvedPlaceholder"
      :autocomplete="meta.autocomplete"
      :aria-invalid="!!errors.length"
      :class="cn(meta.class, 'text-sm')"
      @update:model-value="handleChange"
      @blur="onBlur"
      @keydown.enter="preventEnterSubmit"
    />
  </FormFieldWrapper>
</template>
