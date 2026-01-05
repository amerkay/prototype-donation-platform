<script setup lang="ts">
import { computed } from 'vue'
import { NativeSelect, NativeSelectOption } from '@/components/ui/native-select'
import type { SelectFieldMeta, FieldProps, FieldEmits } from '~/features/form-builder/types'
import { useFieldWrapper } from '~/features/form-builder/composables/useFieldWrapper'
import { useFormBuilderContext } from '~/features/form-builder/composables/useFormBuilderContext'
import FormFieldWrapper from '~/features/form-builder/internal/FormFieldWrapper.vue'
import { cn } from '@/lib/utils'

type Props = FieldProps<string | number, SelectFieldMeta>

const props = defineProps<Props>()
const emit = defineEmits<FieldEmits<string | number>>()

const { fieldContext } = useFormBuilderContext()

const { wrapperProps, resolvedPlaceholder, resolvedDisabled } = useFieldWrapper(
  props.meta,
  props.name,
  () => props.errors
)

// Resolve options (can be static array or function)
const resolvedOptions = computed(() => {
  if (typeof props.meta.options === 'function') {
    return props.meta.options(fieldContext.value)
  }
  return props.meta.options
})

const selectValue = computed({
  get: () => props.modelValue,
  set: (value) => {
    // Find the original option to preserve correct type
    const option = resolvedOptions.value.find((o) => String(o.value) === String(value))
    if (option) {
      emit('update:modelValue', option.value)
    }
  }
})
</script>

<template>
  <FormFieldWrapper v-bind="wrapperProps">
    <NativeSelect
      :id="id || name"
      v-model="selectValue"
      :autocomplete="meta.autocomplete"
      :aria-invalid="!!errors.length"
      :disabled="resolvedDisabled"
      :class="cn('bg-background', meta.class)"
      @blur="onBlur"
    >
      <NativeSelectOption v-if="resolvedPlaceholder" value="">
        {{ resolvedPlaceholder }}
      </NativeSelectOption>
      <NativeSelectOption
        v-for="option in resolvedOptions"
        :key="option.value"
        :value="String(option.value)"
      >
        {{ option.label }}
      </NativeSelectOption>
    </NativeSelect>
  </FormFieldWrapper>
</template>
