<script setup lang="ts">
import { Switch } from '@/components/ui/switch'
import type { ToggleFieldMeta } from '~/features/form-builder/form-builder-types'
import { useResolvedFieldMeta } from '~/features/form-builder/composables/useResolvedFieldMeta'
import FormFieldWrapper from '~/features/form-builder/components/FormFieldWrapper.vue'

interface Props {
  modelValue?: boolean
  errors: string[]
  meta: ToggleFieldMeta
  name: string
  onBlur?: (e?: Event) => void
}

const props = defineProps<Props>()
const emit = defineEmits<{
  'update:modelValue': [value: boolean]
}>()

const { resolvedLabel, resolvedDescription } = useResolvedFieldMeta(props.meta)

const handleChange = (value: boolean) => {
  emit('update:modelValue', value)
}
</script>

<template>
  <FormFieldWrapper
    :name="name"
    :label="resolvedLabel"
    :description="resolvedDescription"
    :optional="meta.optional"
    :errors="errors"
    :invalid="!!errors.length"
    orientation="horizontal"
    :label-class="meta.labelClass"
    :description-class="meta.descriptionClass"
  >
    <Switch
      :id="name"
      :model-value="modelValue"
      :class="meta.class"
      @update:model-value="handleChange"
    />
  </FormFieldWrapper>
</template>
