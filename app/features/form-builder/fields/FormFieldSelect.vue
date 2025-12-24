<script setup lang="ts">
import { computed } from 'vue'
import { NativeSelect, NativeSelectOption } from '@/components/ui/native-select'
import type { SelectFieldMeta } from '~/features/form-builder/form-builder-types'
import { useResolvedFieldMeta } from '~/features/form-builder/composables/useResolvedFieldMeta'
import FormFieldWrapper from '~/features/form-builder/components/FormFieldWrapper.vue'

interface Props {
  modelValue?: string | number
  errors: string[]
  meta: SelectFieldMeta
  name: string
  onBlur?: (e?: Event) => void
}

const props = defineProps<Props>()
const emit = defineEmits<{
  'update:modelValue': [value: string | number]
}>()

const { resolvedLabel, resolvedDescription, resolvedPlaceholder } = useResolvedFieldMeta(props.meta)

const selectValue = computed({
  get: () => props.modelValue,
  set: (value) => {
    // Find the original option to preserve correct type
    const option = props.meta.options.find((o) => String(o.value) === String(value))
    if (option) {
      emit('update:modelValue', option.value)
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
      @blur="onBlur"
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
