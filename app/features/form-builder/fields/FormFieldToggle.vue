<script setup lang="ts">
import { Switch } from '@/components/ui/switch'
import type { ToggleFieldMeta } from '~/features/form-builder/form-builder-types'
import type { FieldProps, FieldEmits } from './shared-field-types'
import { useFieldWrapper } from '~/features/form-builder/composables/useFieldWrapper'
import FormFieldWrapper from '~/features/form-builder/components/FormFieldWrapper.vue'

type Props = FieldProps<boolean, ToggleFieldMeta>

const props = defineProps<Props>()
defineEmits<FieldEmits<boolean>>()

const { wrapperProps } = useFieldWrapper(props.meta, props.name, () => props.errors, {
  orientation: 'horizontal'
})
</script>

<template>
  <FormFieldWrapper v-bind="wrapperProps">
    <Switch
      :id="name"
      :model-value="modelValue"
      :class="meta.class"
      @update:model-value="$emit('update:modelValue', $event)"
    />
  </FormFieldWrapper>
</template>
