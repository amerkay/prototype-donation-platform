<script setup lang="ts">
import { Textarea } from '@/components/ui/textarea'
import type { TextareaFieldMeta } from '~/features/form-builder/form-builder-types'
import { useFieldWrapper } from '~/features/form-builder/composables/useFieldWrapper'
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
