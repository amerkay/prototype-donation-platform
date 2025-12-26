<script setup lang="ts">
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import type { TextFieldMeta, FieldProps, FieldEmits } from '~/features/form-builder/types'
import {
  useFieldWrapper,
  preventEnterSubmit
} from '~/features/form-builder/composables/useFieldWrapper'
import FormFieldWrapper from '~/features/form-builder/components/FormFieldWrapper.vue'

type Props = FieldProps<string | number, TextFieldMeta>

const props = defineProps<Props>()
defineEmits<FieldEmits<string | number | undefined>>()

const { wrapperProps, resolvedPlaceholder } = useFieldWrapper(
  props.meta,
  props.name,
  () => props.errors
)
</script>

<template>
  <FormFieldWrapper v-bind="wrapperProps">
    <Input
      :id="name"
      :model-value="modelValue"
      :placeholder="resolvedPlaceholder"
      :autocomplete="meta.autocomplete"
      :maxlength="meta.maxLength"
      :aria-invalid="!!errors.length"
      :class="cn(meta.class, 'text-sm')"
      @update:model-value="$emit('update:modelValue', $event)"
      @blur="onBlur"
      @keydown.enter="preventEnterSubmit"
    />
  </FormFieldWrapper>
</template>
