<script setup lang="ts">
import { Switch } from '@/components/ui/switch'
import type { FieldProps, FieldEmits, ToggleFieldDef } from '~/features/_library/form-builder/types'
import { useFieldWrapper } from '~/features/_library/form-builder/composables/useFieldWrapper'
import FormFieldWrapper from '~/features/_library/form-builder/internal/FormFieldWrapper.vue'

type Props = FieldProps<boolean, ToggleFieldDef>

const props = defineProps<Props>()
defineEmits<FieldEmits<boolean>>()

const { wrapperProps, resolvedDisabled } = useFieldWrapper(
  props.meta,
  props.name,
  () => props.errors,
  {
    orientation: 'horizontal'
  }
)
</script>

<template>
  <FormFieldWrapper v-bind="wrapperProps">
    <Switch
      :id="id || name"
      :model-value="modelValue"
      :disabled="resolvedDisabled"
      :class="meta.class"
      @update:model-value="$emit('update:modelValue', $event)"
    />
  </FormFieldWrapper>
</template>
