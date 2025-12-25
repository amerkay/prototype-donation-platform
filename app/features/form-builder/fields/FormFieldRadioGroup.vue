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
import type { RadioGroupFieldMeta, FieldProps, FieldEmits } from '~/features/form-builder/types'
import { useFieldWrapper } from '~/features/form-builder/composables/useFieldWrapper'
import FormFieldWrapper from '~/features/form-builder/components/FormFieldWrapper.vue'

type Props = FieldProps<string | number, RadioGroupFieldMeta>

const props = defineProps<Props>()
defineEmits<FieldEmits<string | number>>()

const { wrapperProps } = useFieldWrapper(props.meta, props.name, () => props.errors, {
  variant: 'fieldset'
})
</script>

<template>
  <FormFieldWrapper v-bind="wrapperProps">
    <RadioGroup
      :name="name"
      :model-value="modelValue"
      :aria-invalid="!!errors.length"
      :class="cn(meta.class, 'gap-4')"
      @update:model-value="$emit('update:modelValue', $event)"
    >
      <FieldLabel
        v-for="option in meta.options"
        :key="option.value"
        :for="`${name}-${option.value}`"
      >
        <Field orientation="horizontal" :data-invalid="!!errors.length">
          <FieldContent>
            <FieldTitle>{{ option.label }}</FieldTitle>
            <FieldDescription v-if="option.description">{{ option.description }}</FieldDescription>
          </FieldContent>
          <RadioGroupItem
            :id="`${name}-${option.value}`"
            :value="String(option.value)"
            :aria-invalid="!!errors.length"
          />
        </Field>
      </FieldLabel>
    </RadioGroup>
  </FormFieldWrapper>
</template>
