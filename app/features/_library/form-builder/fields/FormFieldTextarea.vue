<script setup lang="ts">
import { computed } from 'vue'
import { Textarea } from '@/components/ui/textarea'
import { cn } from '@/lib/utils'
import type {
  FieldProps,
  FieldEmits,
  TextareaFieldDef
} from '~/features/_library/form-builder/types'
import { useFieldWrapper } from '~/features/_library/form-builder/composables/useFieldWrapper'
import FormFieldWrapper from '~/features/_library/form-builder/internal/FormFieldWrapper.vue'

type Props = FieldProps<string | number, TextareaFieldDef>

const props = defineProps<Props>()
defineEmits<FieldEmits<string | number | undefined>>()

const { wrapperProps, resolvedPlaceholder, resolvedDisabled, resolvedClass } = useFieldWrapper(
  props.meta,
  props.name,
  () => props.errors,
  {},
  () => props.fullPath
)

const charCount = computed(() => {
  const value = (props.modelValue as string) || ''
  return value.length
})

const maxLengthDisplay = computed(() => {
  if (!props.meta.isShowMaxLengthIndicator || !props.meta.maxLength) {
    return undefined
  }
  return `${charCount.value}/${props.meta.maxLength} characters`
})
</script>

<template>
  <FormFieldWrapper v-bind="wrapperProps">
    <Textarea
      :id="id || name"
      :model-value="modelValue"
      :placeholder="resolvedPlaceholder"
      :rows="meta.rows"
      :maxlength="meta.maxLength"
      :disabled="resolvedDisabled"
      :aria-invalid="!!errors.length"
      :class="cn('bg-background', resolvedClass)"
      @update:model-value="$emit('update:modelValue', $event)"
      @blur="onBlur"
    />
    <p v-if="maxLengthDisplay" class="text-xs text-muted-foreground mt-1">
      {{ maxLengthDisplay }}
    </p>
  </FormFieldWrapper>
</template>
