<script setup lang="ts">
import { computed } from 'vue'
import { NativeSelect, NativeSelectOption } from '@/components/ui/native-select'
import type { SelectFieldMeta, FieldProps, FieldEmits } from '~/features/form-builder/types'
import { useFieldWrapper } from '~/features/form-builder/composables/useFieldWrapper'
import FormFieldWrapper from '~/features/form-builder/components/FormFieldWrapper.vue'

type Props = FieldProps<string | number, SelectFieldMeta>

const props = defineProps<Props>()
const emit = defineEmits<FieldEmits<string | number>>()

const { wrapperProps, resolvedPlaceholder } = useFieldWrapper(
  props.meta,
  props.name,
  () => props.errors
)

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
  <FormFieldWrapper v-bind="wrapperProps">
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
