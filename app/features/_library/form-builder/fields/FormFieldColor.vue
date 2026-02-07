<script setup lang="ts">
import { Input } from '@/components/ui/input'
import type { FieldProps, FieldEmits, ColorFieldDef } from '~/features/_library/form-builder/types'
import { useFieldWrapper } from '~/features/_library/form-builder/composables/useFieldWrapper'
import FormFieldWrapper from '~/features/_library/form-builder/internal/FormFieldWrapper.vue'

type Props = FieldProps<string, ColorFieldDef>

const props = defineProps<Props>()
const emit = defineEmits<FieldEmits<string>>()

const { wrapperProps, resolvedDisabled } = useFieldWrapper(
  props.meta,
  props.name,
  () => props.errors,
  {},
  () => props.fullPath
)

const colorInputRef = ref<HTMLInputElement>()

function handleSwatchClick() {
  if (!resolvedDisabled.value) {
    colorInputRef.value?.click()
  }
}

function handleColorInput(e: Event) {
  emit('update:modelValue', (e.target as HTMLInputElement).value)
}

function handleTextInput(value: string | number) {
  const hex = String(value)
  if (/^#[0-9a-fA-F]{6}$/.test(hex)) {
    emit('update:modelValue', hex)
  } else {
    emit('update:modelValue', hex)
  }
}
</script>

<template>
  <FormFieldWrapper v-bind="wrapperProps">
    <div class="flex items-center gap-2">
      <button
        type="button"
        class="h-9 w-9 shrink-0 rounded-md border border-input shadow-xs transition-colors hover:ring-2 hover:ring-ring hover:ring-offset-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
        :style="{ backgroundColor: modelValue || '#000000' }"
        :disabled="resolvedDisabled"
        @click="handleSwatchClick"
      />
      <input
        ref="colorInputRef"
        type="color"
        :value="modelValue || '#000000'"
        class="sr-only"
        :disabled="resolvedDisabled"
        @input="handleColorInput"
      />
      <Input
        :model-value="modelValue || ''"
        placeholder="#000000"
        class="flex-1 font-mono text-sm"
        :disabled="resolvedDisabled"
        @update:model-value="handleTextInput"
      />
    </div>
  </FormFieldWrapper>
</template>
