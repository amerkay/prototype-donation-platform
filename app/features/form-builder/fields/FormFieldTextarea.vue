<script setup lang="ts">
import { Textarea } from '@/components/ui/textarea'
import type { TextareaFieldMeta } from '~/features/form-builder/form-builder-types'
import { useResolvedFieldMeta } from '~/features/form-builder/composables/useResolvedFieldMeta'
import FormFieldWrapper from '~/features/form-builder/components/FormFieldWrapper.vue'

interface Props {
  modelValue?: string | number
  errors: string[]
  meta: TextareaFieldMeta
  name: string
  onBlur?: (e?: Event) => void
}

const props = defineProps<Props>()
const emit = defineEmits<{
  'update:modelValue': [value: string | number | undefined]
}>()

const { resolvedLabel, resolvedPlaceholder } = useResolvedFieldMeta(props.meta)

const handleChange = (value: string | number | undefined) => {
  emit('update:modelValue', value)
}
</script>

<template>
  <FormFieldWrapper
    :name="name"
    :label="resolvedLabel"
    :optional="meta.optional"
    :errors="errors"
    :invalid="!!errors.length"
    :label-class="meta.labelClass"
  >
    <Textarea
      :id="name"
      :model-value="modelValue"
      :placeholder="resolvedPlaceholder"
      :rows="meta.rows"
      :maxlength="meta.maxLength"
      :aria-invalid="!!errors.length"
      :class="meta.class"
      @update:model-value="handleChange"
      @blur="onBlur"
    />
  </FormFieldWrapper>
</template>
