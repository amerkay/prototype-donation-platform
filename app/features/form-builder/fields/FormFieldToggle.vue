<script setup lang="ts">
import { computed } from 'vue'
import { Switch } from '@/components/ui/switch'
import type { ToggleFieldMeta, VeeFieldContext } from '~/features/form-builder/form-builder-types'
import { useResolvedFieldMeta } from '~/features/form-builder/composables/useResolvedFieldMeta'
import { useFieldChange } from '~/features/form-builder/composables/useFieldChange'
import FormFieldWrapper from '~/features/form-builder/components/FormFieldWrapper.vue'

interface Props {
  field: VeeFieldContext
  errors: string[]
  meta: ToggleFieldMeta
  name: string
  onFieldChange?: (value: unknown, fieldOnChange: (value: unknown) => void) => void
}

const props = defineProps<Props>()

const { resolvedLabel, resolvedDescription } = useResolvedFieldMeta(props.meta)
const { handleChange } = useFieldChange(props.field, props.onFieldChange)

const switchValue = computed(() => props.field.value as boolean | undefined)
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
    class="mb-4"
  >
    <Switch
      :id="name"
      :model-value="switchValue"
      :class="meta.class"
      @update:model-value="handleChange"
    />
  </FormFieldWrapper>
</template>
