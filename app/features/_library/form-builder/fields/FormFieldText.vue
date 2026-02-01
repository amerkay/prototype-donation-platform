<script setup lang="ts">
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import type { FieldProps, FieldEmits, TextFieldDef } from '~/features/_library/form-builder/types'
import {
  useFieldWrapper,
  preventEnterSubmit
} from '~/features/_library/form-builder/composables/useFieldWrapper'
import FormFieldWrapper from '~/features/_library/form-builder/internal/FormFieldWrapper.vue'

type Props = FieldProps<string | number, TextFieldDef>

const props = defineProps<Props>()
defineEmits<FieldEmits<string | number | undefined>>()

const { wrapperProps, resolvedPlaceholder, resolvedDisabled, resolvedClass } = useFieldWrapper(
  props.meta,
  props.name,
  () => props.errors,
  {},
  () => props.fullPath
)
</script>

<template>
  <FormFieldWrapper v-bind="wrapperProps">
    <Input
      :id="id || name"
      :model-value="modelValue"
      :placeholder="resolvedPlaceholder"
      :autocomplete="meta.autocomplete"
      :maxlength="meta.maxLength"
      :disabled="resolvedDisabled"
      :aria-invalid="!!errors.length"
      :class="cn('bg-background', resolvedClass, 'text-sm')"
      @update:model-value="$emit('update:modelValue', $event)"
      @blur="onBlur"
      @keydown.enter="preventEnterSubmit"
    />
  </FormFieldWrapper>
</template>
