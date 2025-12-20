<script setup lang="ts">
import { computed } from 'vue'
import { NativeSelect, NativeSelectOption } from '@/components/ui/native-select'
import type { SelectFieldMeta, VeeFieldContext } from '~/features/form-builder/form-builder-types'
import { useResolvedFieldMeta } from '~/features/form-builder/composables/useResolvedFieldMeta'
import { useFieldChange } from '~/features/form-builder/composables/useFieldChange'
import FormFieldWrapper from '~/features/form-builder/components/FormFieldWrapper.vue'

interface Props {
  field: VeeFieldContext
  errors: string[]
  meta: SelectFieldMeta
  name: string
  onFieldChange?: (value: unknown, fieldOnChange: (value: unknown) => void) => void
}

const props = defineProps<Props>()

const { resolvedLabel, resolvedDescription, resolvedPlaceholder } = useResolvedFieldMeta(props.meta)
const { handleChange } = useFieldChange(props.field, props.onFieldChange)

const selectValue = computed({
  get: () => props.field.value as string | number | undefined,
  set: (value) => {
    // Find the original option to preserve correct type
    const option = props.meta.options.find((o) => String(o.value) === String(value))
    if (option) {
      handleChange(option.value)
    }
  }
})
</script>

<template>
  <FormFieldWrapper
    :name="name"
    :label="resolvedLabel"
    :description="resolvedDescription"
    :optional="meta.optional"
    :errors="errors"
    :invalid="!!errors.length"
    :label-class="meta.labelClass"
    :description-class="meta.descriptionClass"
  >
    <NativeSelect
      :id="name"
      v-model="selectValue"
      :autocomplete="meta.autocomplete"
      :aria-invalid="!!errors.length"
      :disabled="meta.disabled"
      :class="meta.class"
      @blur="field.onBlur"
    >
      <NativeSelectOption v-if="resolvedPlaceholder" value="">
        {{ resolvedPlaceholder }}
      </NativeSelectOption>
      <NativeSelectOption
        v-for="option in meta.options"
        :key="option.value"
        :value="String(option.value)"
      >
        {{ option.label }}
      </NativeSelectOption>
    </NativeSelect>
  </FormFieldWrapper>
</template>
