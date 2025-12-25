<script setup lang="ts">
import { computed } from 'vue'
import { Slider } from '@/components/ui/slider'
import type { SliderFieldMeta, FieldProps, FieldEmits } from '~/features/form-builder/types'
import { useFormBuilderContext } from '~/features/form-builder/composables/useFormBuilderContext'
import { useFieldWrapper } from '~/features/form-builder/composables/useFieldWrapper'
import FormFieldWrapper from '~/features/form-builder/components/FormFieldWrapper.vue'

type Props = FieldProps<number, SliderFieldMeta>

const props = defineProps<Props>()
const emit = defineEmits<FieldEmits<number>>()

const { formValues } = useFormBuilderContext()
const { wrapperProps } = useFieldWrapper(props.meta, props.name, () => props.errors)

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
  const val = props.modelValue
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
    emit('update:modelValue', newValue)
  }
}
</script>

<template>
  <FormFieldWrapper v-bind="wrapperProps">
    <div class="space-y-4">
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
