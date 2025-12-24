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
import type { RadioGroupFieldMeta } from '~/features/form-builder/form-builder-types'
import { useFieldWrapper } from '~/features/form-builder/composables/useFieldWrapper'
import FormFieldSetWrapper from '~/features/form-builder/components/FormFieldSetWrapper.vue'

interface Props {
  modelValue?: string | number
  errors: string[]
  meta: RadioGroupFieldMeta
  name: string
  onBlur?: (e?: Event) => void
}

const props = defineProps<Props>()
const emit = defineEmits<{
  'update:modelValue': [value: string | number]
}>()

const { wrapperProps } = useFieldWrapper(props.meta, props.name, () => props.errors, {
  variant: 'fieldset'
})

const handleChange = (value: string | number) => {
  emit('update:modelValue', value)
}
</script>

<template>
  <FormFieldSetWrapper v-bind="wrapperProps">
    <RadioGroup
      :name="name"
      :model-value="modelValue"
      :aria-invalid="!!errors.length"
      :class="cn(meta.class, 'gap-4')"
      @update:model-value="handleChange"
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
  </FormFieldSetWrapper>
</template>
