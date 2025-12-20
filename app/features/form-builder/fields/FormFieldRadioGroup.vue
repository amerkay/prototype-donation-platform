<script setup lang="ts">
import { computed } from 'vue'
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
  RadioGroupFieldMeta,
  VeeFieldContext
} from '~/features/form-builder/form-builder-types'
import { useResolvedFieldMeta } from '~/features/form-builder/composables/useResolvedFieldMeta'
import { useFieldChange } from '~/features/form-builder/composables/useFieldChange'
import FormFieldSetWrapper from '~/features/form-builder/components/FormFieldSetWrapper.vue'

interface Props {
  field: VeeFieldContext
  errors: string[]
  meta: RadioGroupFieldMeta
  name: string
  onFieldChange?: (value: unknown, fieldOnChange: (value: unknown) => void) => void
}

const props = defineProps<Props>()

const fieldValue = computed(() => props.field.value as string | number | undefined)

const { resolvedLabel, resolvedDescription } = useResolvedFieldMeta(props.meta)
const { handleChange } = useFieldChange(props.field, props.onFieldChange)
</script>

<template>
  <FormFieldSetWrapper
    :legend="resolvedLabel"
    :description="resolvedDescription"
    :optional="meta.optional"
    :errors="errors"
    :invalid="!!errors.length"
    :legend-class="meta.labelClass"
    :description-class="meta.descriptionClass"
  >
    <RadioGroup
      :name="field.name"
      :model-value="fieldValue"
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
