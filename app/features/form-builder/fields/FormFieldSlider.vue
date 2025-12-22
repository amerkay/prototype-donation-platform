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

// Resolve dynamic min/max/step values
const resolvedMin = computed(() => {
  const min = props.meta.min
  return typeof min === 'function' ? min(formValues.value) : (min ?? 0)
})

const resolvedMax = computed(() => {
  const max = props.meta.max
  return typeof max === 'function' ? max(formValues.value) : (max ?? 100)
})

const resolvedStep = computed(() => {
  const step = props.meta.step
  return typeof step === 'function' ? step(formValues.value) : (step ?? 1)
})

const numberValue = computed(() => {
  const val = props.field.value
  if (typeof val === 'number') return val
  if (val === null || val === undefined) return resolvedMin.value
  return Number(val) || resolvedMin.value
})

const formattedValue = computed(() => {
  if (props.meta.formatValue) {
    return props.meta.formatValue(numberValue.value, formValues.value)
  }
  return String(numberValue.value)
})

const minMaxFormat = (value: number) => {
  if (props.meta.minMaxFormatter) {
    return props.meta.minMaxFormatter(value, formValues.value)
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
        :min="resolvedMin"
        :max="resolvedMax"
        :step="resolvedStep"
        :class="meta.class"
        class="**:data-[slot=slider-track]:h-2.5 **:data-[slot=slider-thumb]:size-6"
        @update:model-value="handleSliderChange"
      />
      <!-- </div> -->

      <!-- Min/Max labels -->
      <div v-if="meta.showMinMax" class="flex justify-between text-xs text-muted-foreground">
        <span>{{ minMaxFormat(resolvedMin) }}</span>
        <span>{{ minMaxFormat(resolvedMax) }}</span>
      </div>
    </div>
  </FormFieldWrapper>
</template>
