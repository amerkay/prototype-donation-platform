<script setup lang="ts">
import { cn } from '@/lib/utils'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import {
  FieldDescription,
  FieldLabel,
  Field,
  FieldContent,
  FieldTitle
} from '@/components/ui/field'
import type {
  FieldProps,
  FieldEmits,
  RadioGroupFieldDef
} from '~/features/_library/form-builder/types'
import { useFieldWrapper } from '~/features/_library/form-builder/composables/useFieldWrapper'
import FormFieldWrapper from '~/features/_library/form-builder/internal/FormFieldWrapper.vue'

type Props = FieldProps<string | number, RadioGroupFieldDef>

const props = defineProps<Props>()
defineEmits<FieldEmits<string | number>>()

const { wrapperProps, resolvedDisabled, resolvedClass } = useFieldWrapper(
  props.meta,
  props.name,
  () => props.errors,
  {
    variant: 'fieldset'
  },
  () => props.fullPath
)
</script>

<template>
  <FormFieldWrapper v-bind="wrapperProps">
    <RadioGroup
      :name="name"
      :model-value="modelValue"
      :disabled="resolvedDisabled"
      :aria-invalid="!!errors.length"
      :orientation="meta.orientation"
      :class="cn(meta.orientation === 'horizontal' && 'grid-flow-col', resolvedClass)"
      @update:model-value="$emit('update:modelValue', $event)"
    >
      <FieldLabel
        v-for="option in meta.options"
        :key="option.value"
        :for="`${id || name}-${option.value}`"
      >
        <Field orientation="horizontal" :data-invalid="!!errors.length">
          <FieldContent>
            <FieldTitle>{{ option.label }}</FieldTitle>
            <FieldDescription v-if="option.description">{{ option.description }}</FieldDescription>
          </FieldContent>
          <RadioGroupItem
            :id="`${id || name}-${option.value}`"
            :value="String(option.value)"
            :aria-invalid="!!errors.length"
          />
        </Field>
      </FieldLabel>
    </RadioGroup>
  </FormFieldWrapper>
</template>
