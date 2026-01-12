<script setup lang="ts">
import { Switch } from '@/components/ui/switch'
import type { FieldProps, FieldEmits, ToggleFieldDef } from '~/features/form-builder/types'
import { useFieldWrapper } from '~/features/form-builder/composables/useFieldWrapper'
import FormFieldWrapper from '~/features/form-builder/internal/FormFieldWrapper.vue'

type Props = FieldProps<boolean, ToggleFieldDef>

const props = defineProps<Props>()
defineEmits<FieldEmits<boolean>>()

const { wrapperProps } = useFieldWrapper(props.meta, props.name, () => props.errors, {
  orientation: 'horizontal'
})
</script>

<template>
  <FormFieldWrapper v-bind="wrapperProps">
    <Switch
      :id="id || name"
      :model-value="modelValue"
      :class="meta.class"
      @update:model-value="$emit('update:modelValue', $event)"
    />
  </FormFieldWrapper>
</template>
