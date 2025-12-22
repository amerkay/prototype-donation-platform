<script setup lang="ts">
import { computed } from 'vue'
import { Slider } from '@/components/ui/slider'
import type { SliderFieldMeta, VeeFieldContext } from '~/features/form-builder/form-builder-types'
import { useFormBuilderContext } from '~/features/form-builder/composables/useFormBuilderContext'
import { useResolvedFieldMeta } from '~/features/form-builder/composables/useResolvedFieldMeta'
import FormFieldWrapper from '~/features/form-builder/components/FormFieldWrapper.vue'

interface Props {
  field: VeeFieldContext
  errors: string[]
  meta: SliderFieldMeta
  name: string
  onChange?: (value: unknown) => void
}

const props = defineProps<Props>()

const { formValues } = useFormBuilderContext()
const { resolvedLabel, resolvedDescription } = useResolvedFieldMeta(props.meta, formValues)

const numberValue = computed(() => {
  const val = props.field.value
  if (typeof val === 'number') return val
  if (val === null || val === undefined) return props.meta.min ?? 0
  return (Number(val) || props.meta.min) ?? 0
})

const formattedValue = computed(() => {
  if (props.meta.formatValue) {
    return props.meta.formatValue(numberValue.value, formValues.value)
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
    props.field.onChange(newValue)
    props.onChange?.(newValue)
  }
}
</script>

<template>
  <FormFieldWrapper
    :name="name"
    :label="resolvedLabel"
    :description="resolvedDescription"
    :optional="meta.optional"
    :errors="errors"
    :invalid="!!errors.length"
    :label-class="meta.labelClass"
    :description-class="meta.descriptionClass"
  >
    <div class="space-y-3">
      <!-- Formatted value display -->
      <div class="flex items-center justify-between">
        <span class="text-2xl font-semibold">
          <span v-if="meta.prefix">{{ meta.prefix }}</span
          >{{ formattedValue }}<span v-if="meta.suffix">{{ meta.suffix }}</span>
        </span>
      </div>

      <!-- Slider -->
      <!-- <div class="py-3 px-1"> -->
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
      <!-- </div> -->

      <!-- Min/Max labels -->
      <div v-if="meta.showMinMax" class="flex justify-between text-xs text-muted-foreground">
        <span>{{ minMaxFormat(meta.min ?? 0) }}</span>
        <span>{{ minMaxFormat(meta.max ?? 100) }}</span>
      </div>
    </div>
  </FormFieldWrapper>
</template>
