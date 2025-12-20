<script setup lang="ts">
import { computed } from 'vue'
import { Textarea } from '@/components/ui/textarea'
import type { TextareaFieldMeta, VeeFieldContext } from '~/features/form-builder/form-builder-types'
import { useResolvedFieldMeta } from '~/features/form-builder/composables/useResolvedFieldMeta'
import FormFieldWrapper from '~/features/form-builder/components/FormFieldWrapper.vue'

interface Props {
  field: VeeFieldContext
  errors: string[]
  meta: TextareaFieldMeta
  name: string
  onChange?: (value: unknown) => void
}

const props = defineProps<Props>()

const textareaValue = computed(() => props.field.value as string | number | undefined)

const { resolvedLabel, resolvedPlaceholder } = useResolvedFieldMeta(props.meta)

const handleChange = (value: unknown) => {
  props.field.onChange(value)
  props.onChange?.(value)
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
      :model-value="textareaValue"
      :placeholder="resolvedPlaceholder"
      :rows="meta.rows"
      :maxlength="meta.maxLength"
      :aria-invalid="!!errors.length"
      :class="meta.class"
      @update:model-value="handleChange"
      @blur="field.onBlur"
    />
  </FormFieldWrapper>
</template>
