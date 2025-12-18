<script setup lang="ts">
import { inject, computed } from 'vue'
import { Slider } from '@/components/ui/slider'
import { Field, FieldLabel, FieldError, FieldDescription } from '@/components/ui/field'
import type { SliderFieldMeta, VeeFieldContext } from '~/features/form-builder/form-builder-types'

interface Props {
  field: VeeFieldContext
  errors: string[]
  meta: SliderFieldMeta
  name: string
  onFieldChange?: (value: unknown, fieldOnChange: (value: unknown) => void) => void
}

const props = defineProps<Props>()

const formValues = inject<() => Record<string, unknown>>('formValues', () => ({}))

const numberValue = computed(() => {
  const val = props.field.value
  if (typeof val === 'number') return val
  if (val === null || val === undefined) return props.meta.min ?? 0
  return (Number(val) || props.meta.min) ?? 0
})

const resolvedLabel = computed(() => {
  if (!props.meta.label) return undefined
  if (typeof props.meta.label === 'function') {
    return props.meta.label(formValues())
  }
  return props.meta.label
})

const resolvedDescription = computed(() => {
  if (!props.meta.description) return undefined
  if (typeof props.meta.description === 'function') {
    return props.meta.description(formValues())
  }
  return props.meta.description
})

const formattedValue = computed(() => {
  if (props.meta.formatValue) {
    return props.meta.formatValue(numberValue.value, formValues())
  }
  return String(numberValue.value)
})

const minMaxFormat = (value: number) => {
  if (props.meta.minMaxFormatter) {
    return props.meta.minMaxFormatter(value)
  }
  return String(value)
}

const handleSliderChange = (value: number[] | undefined) => {
  const newValue = value?.[0]
  if (newValue !== undefined) {
    if (props.onFieldChange) {
      props.onFieldChange(newValue, props.field.onChange)
    } else {
      props.field.onChange(newValue)
    }
  }
}
</script>

<template>
  <Field :data-invalid="!!errors.length">
    <FieldLabel v-if="resolvedLabel" :for="name" :class="meta.labelClass">
      {{ resolvedLabel }}
      <span v-if="meta.optional" class="text-muted-foreground font-normal">(optional)</span>
    </FieldLabel>
    <FieldDescription v-if="resolvedDescription" :class="meta.descriptionClass">
      {{ resolvedDescription }}
    </FieldDescription>

    <div class="space-y-2">
      <!-- Formatted value display -->
      <div class="flex items-center justify-between">
        <span class="text-2xl font-semibold">{{ formattedValue }}</span>
      </div>

      <!-- Slider -->
      <Slider
        :id="name"
        :model-value="[numberValue]"
        :min="meta.min ?? 0"
        :max="meta.max ?? 100"
        :step="meta.step ?? 1"
        :class="meta.class"
        class="**:data-[slot=slider-track]:h-2.5 **:data-[slot=slider-thumb]:size-6"
        @update:model-value="handleSliderChange"
      />

      <!-- Min/Max labels -->
      <div v-if="meta.showMinMax" class="flex justify-between text-xs text-muted-foreground">
        <span>{{ minMaxFormat(meta.min ?? 0) }}</span>
        <span>{{ minMaxFormat(meta.max ?? 100) }}</span>
      </div>
    </div>

    <FieldError v-if="errors.length" :errors="errors.slice(0, 1)" />
  </Field>
</template>
