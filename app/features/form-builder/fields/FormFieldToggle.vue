<script setup lang="ts">
import { computed, inject } from 'vue'
import { Switch } from '@/components/ui/switch'
import { Field, FieldContent, FieldLabel, FieldDescription } from '@/components/ui/field'
import type { ToggleFieldMeta, VeeFieldContext } from '~/features/form-builder/form-builder-types'

interface Props {
  field: VeeFieldContext
  errors: string[]
  meta: ToggleFieldMeta
  name: string
  onFieldChange?: (value: unknown, fieldOnChange: (value: unknown) => void) => void
}

const props = defineProps<Props>()

// Inject form values for dynamic descriptions
const formValues = inject<() => Record<string, unknown>>('formValues', () => ({}))

const switchValue = computed(() => props.field.value as boolean | undefined)

// Resolve description (static string or dynamic function)
const resolvedDescription = computed(() => {
  if (!props.meta.description) return undefined
  if (typeof props.meta.description === 'function') {
    return props.meta.description(formValues())
  }
  return props.meta.description
})
</script>

<template>
  <Field orientation="horizontal" class="my-4">
    <FieldContent>
      <FieldLabel v-if="meta.label" :for="name" :class="meta.labelClass">
        {{ meta.label }}
      </FieldLabel>
      <FieldDescription v-if="resolvedDescription" :class="meta.classDescription">
        {{ resolvedDescription }}
      </FieldDescription>
    </FieldContent>
    <Switch
      :id="name"
      :model-value="switchValue"
      :class="meta.class"
      @update:model-value="
        (value) => (onFieldChange ? onFieldChange(value, field.onChange) : field.onChange(value))
      "
    />
  </Field>
</template>
