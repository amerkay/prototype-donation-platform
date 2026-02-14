<script setup lang="ts">
import { computed, unref } from 'vue'
import { NativeSelect, NativeSelectOption } from '@/components/ui/native-select'
import type { FieldProps, FieldEmits, SelectFieldDef } from '~/features/_library/form-builder/types'
import { useFieldWrapper } from '~/features/_library/form-builder/composables/useFieldWrapper'
import { useFormBuilderContext } from '~/features/_library/form-builder/composables/useFormBuilderContext'
import FormFieldWrapper from '~/features/_library/form-builder/internal/FormFieldWrapper.vue'
import { cn } from '@/lib/utils'

type Props = FieldProps<string | number, SelectFieldDef>

const props = defineProps<Props>()
const emit = defineEmits<FieldEmits<string | number>>()

const { fieldContext } = useFormBuilderContext()

const { wrapperProps, resolvedPlaceholder, resolvedDisabled, resolvedClass } = useFieldWrapper(
  props.meta,
  props.name,
  () => props.errors,
  {},
  () => props.fullPath
)

// Resolve options (can be static array, function, or ComputedRef)
const resolvedOptions = computed(() => {
  const opts = props.meta.options
  // Handle ComputedRef
  if (opts && typeof opts === 'object' && 'value' in opts) {
    return unref(opts)
  }
  if (typeof opts === 'function') {
    return opts(fieldContext.value)
  }
  return opts
})

const selectValue = computed({
  get: () => props.modelValue,
  set: (value) => {
    // Placeholder selected — clear the field
    if (value === '' || value === undefined) {
      emit('update:modelValue', '')
      return
    }
    // Find the original option to preserve correct type
    const option = resolvedOptions.value.find(
      (o: { value: string | number }) => String(o.value) === String(value)
    )
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
      :class="cn('bg-background', resolvedClass)"
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
