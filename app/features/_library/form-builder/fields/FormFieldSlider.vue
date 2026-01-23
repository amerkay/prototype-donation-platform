<script setup lang="ts">
import { computed, unref } from 'vue'
import { Slider } from '@/components/ui/slider'
import type { FieldProps, FieldEmits, SliderFieldDef } from '~/features/_library/form-builder/types'
import { useFormBuilderContext } from '~/features/_library/form-builder/composables/useFormBuilderContext'
import { useFieldWrapper } from '~/features/_library/form-builder/composables/useFieldWrapper'
import FormFieldWrapper from '~/features/_library/form-builder/internal/FormFieldWrapper.vue'

type Props = FieldProps<number, SliderFieldDef>

const props = defineProps<Props>()
const emit = defineEmits<FieldEmits<number>>()

const { fieldContext } = useFormBuilderContext()
const { wrapperProps } = useFieldWrapper(props.meta, props.name, () => props.errors)

// Resolve dynamic min/max/step values (can be static, function, or ComputedRef)
const resolvedMin = computed(() => {
  const min = props.meta.min
  if (min && typeof min === 'object' && 'value' in min) return unref(min)
  return typeof min === 'function' ? min(fieldContext.value) : (min ?? 0)
})

const resolvedMax = computed(() => {
  const max = props.meta.max
  if (max && typeof max === 'object' && 'value' in max) return unref(max)
  return typeof max === 'function' ? max(fieldContext.value) : (max ?? 100)
})

const resolvedStep = computed(() => {
  const step = props.meta.step
  if (step && typeof step === 'object' && 'value' in step) return unref(step)
  return typeof step === 'function' ? step(fieldContext.value) : (step ?? 1)
})

const resolvedPrefix = computed(() => {
  const prefix = props.meta.prefix
  if (prefix && typeof prefix === 'object' && 'value' in prefix) return unref(prefix)
  return typeof prefix === 'function' ? prefix(fieldContext.value) : prefix
})

const resolvedSuffix = computed(() => {
  const suffix = props.meta.suffix
  if (suffix && typeof suffix === 'object' && 'value' in suffix) return unref(suffix)
  return typeof suffix === 'function' ? suffix(fieldContext.value) : suffix
})

const numberValue = computed(() => {
  const val = props.modelValue
  if (typeof val === 'number') return val
  if (val === null || val === undefined) return resolvedMin.value
  return Number(val) || resolvedMin.value
})

const formattedValue = computed(() => {
  if (props.meta.formatValue) {
    return props.meta.formatValue(numberValue.value, fieldContext.value)
  }
  return String(numberValue.value)
})

const minMaxFormat = (value: number) => {
  if (props.meta.minMaxFormatter) {
    return props.meta.minMaxFormatter(value, fieldContext.value)
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
          <span v-if="resolvedPrefix">{{ resolvedPrefix }}</span
          >{{ formattedValue }}<span v-if="resolvedSuffix">{{ resolvedSuffix }}</span>
        </span>
      </div>

      <!-- Slider -->
      <!-- <div class="py-3 px-1"> -->
      <Slider
        :id="id || name"
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
