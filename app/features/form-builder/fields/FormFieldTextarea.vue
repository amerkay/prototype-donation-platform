<script setup lang="ts">
import { computed } from 'vue'
import { Textarea } from '@/components/ui/textarea'
import { cn } from '@/lib/utils'
import type { FieldProps, FieldEmits, TextareaFieldDef } from '~/features/form-builder/types'
import { useFieldWrapper } from '~/features/form-builder/composables/useFieldWrapper'
import FormFieldWrapper from '~/features/form-builder/internal/FormFieldWrapper.vue'

type Props = FieldProps<string | number, TextareaFieldDef>

const props = defineProps<Props>()
defineEmits<FieldEmits<string | number | undefined>>()

const { wrapperProps, resolvedPlaceholder } = useFieldWrapper(
  props.meta,
  props.name,
  () => props.errors
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
      :aria-invalid="!!errors.length"
      :class="cn('bg-background', meta.class)"
      @update:model-value="$emit('update:modelValue', $event)"
      @blur="onBlur"
    />
    <p v-if="maxLengthDisplay" class="text-xs text-muted-foreground mt-1">
      {{ maxLengthDisplay }}
    </p>
  </FormFieldWrapper>
</template>
