<script setup lang="ts">
import { computed } from 'vue'
import { Switch } from '@/components/ui/switch'
import type { ToggleFieldMeta, VeeFieldContext } from '~/features/form-builder/form-builder-types'
import { useResolvedFieldMeta } from '~/features/form-builder/composables/useResolvedFieldMeta'
import FormFieldWrapper from '~/features/form-builder/components/FormFieldWrapper.vue'

interface Props {
  field: VeeFieldContext
  errors: string[]
  meta: ToggleFieldMeta
  name: string
  onChange?: (value: unknown) => void
}

const props = defineProps<Props>()

const { resolvedLabel, resolvedDescription } = useResolvedFieldMeta(props.meta)

const switchValue = computed(() => props.field.value as boolean | undefined)

const handleChange = (value: unknown) => {
  props.field.onChange(value)
  props.onChange?.(value)
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
      :model-value="switchValue"
      :class="meta.class"
      @update:model-value="handleChange"
    />
  </FormFieldWrapper>
</template>
