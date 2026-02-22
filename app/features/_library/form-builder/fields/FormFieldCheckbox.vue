<script setup lang="ts">
import { computed } from 'vue'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldGroup,
  FieldLabel
} from '@/components/ui/field'
import type {
  FieldProps,
  FieldEmits,
  CheckboxFieldDef
} from '~/features/_library/form-builder/types'
import { useFieldWrapper } from '~/features/_library/form-builder/composables/useFieldWrapper'
import FormFieldWrapper from '~/features/_library/form-builder/internal/FormFieldWrapper.vue'

type Props = FieldProps<boolean | string[], CheckboxFieldDef>

const props = defineProps<Props>()
const emit = defineEmits<FieldEmits<boolean | string[]>>()

// Single checkbox mode vs array mode
const isSingleMode = computed(() => !props.meta.options || props.meta.options.length === 0)

const { wrapperProps, resolvedLabel, resolvedDescription, resolvedDisabled, resolvedClass } =
  useFieldWrapper(
    props.meta,
    props.name,
    () => props.errors,
    {
      variant: isSingleMode.value ? 'field' : 'fieldset',
      disableLabelFor: true // We build Field manually for both modes
    },
    () => props.fullPath
  )

// For single mode, suppress label/description from wrapper (we render them inside FieldContent)
const singleWrapperProps = computed(() => {
  const { label, description, labelClass, descriptionClass, ...rest } = wrapperProps.value
  return rest
})

// Single checkbox handlers
const handleSingleUpdate = (checked: boolean | 'indeterminate') => {
  emit('update:modelValue', checked === true)
}

// Array checkbox handlers
const handleArrayUpdate = (optionValue: string, checked: boolean | 'indeterminate') => {
  const currentValues = (props.modelValue as string[]) || []
  const newValue =
    checked === true
      ? [...currentValues, optionValue]
      : currentValues.filter((v) => v !== optionValue)
  emit('update:modelValue', newValue)
}

const isChecked = (optionValue: string): boolean => {
  const currentValues = (props.modelValue as string[]) || []
  return currentValues.includes(optionValue)
}
</script>

<template>
  <!-- Single checkbox mode -->
  <FormFieldWrapper v-if="isSingleMode" v-bind="singleWrapperProps">
    <Field orientation="horizontal" :data-invalid="!!errors.length">
      <Checkbox
        :id="id || name"
        :model-value="!!modelValue"
        :disabled="resolvedDisabled"
        :aria-invalid="!!errors.length"
        :class="resolvedClass"
        @update:model-value="handleSingleUpdate"
      />
      <FieldContent>
        <FieldLabel :for="id || name" class="font-normal">
          {{ resolvedLabel }}
        </FieldLabel>
        <FieldDescription v-if="resolvedDescription">
          {{ resolvedDescription }}
        </FieldDescription>
      </FieldContent>
    </Field>
  </FormFieldWrapper>

  <!-- Checkbox array mode -->
  <FormFieldWrapper v-else v-bind="wrapperProps">
    <FieldGroup data-slot="checkbox-group" class="gap-4">
      <Field
        v-for="option in meta.options"
        :key="option.value"
        orientation="horizontal"
        :data-invalid="!!errors.length"
      >
        <Checkbox
          :id="`${id || name}-${option.value}`"
          :name="name"
          :model-value="isChecked(option.value)"
          :disabled="resolvedDisabled"
          :aria-invalid="!!errors.length"
          :class="resolvedClass"
          @update:model-value="(checked) => handleArrayUpdate(option.value, checked)"
        />
        <FieldLabel :for="`${id || name}-${option.value}`" class="font-normal">
          {{ option.label }}
        </FieldLabel>
      </Field>
    </FieldGroup>
  </FormFieldWrapper>
</template>
