<script setup lang="ts">
import { Switch } from '@/components/ui/switch'
import type { ToggleFieldMeta } from '~/features/form-builder/form-builder-types'
import { useFieldWrapper } from '~/features/form-builder/composables/useFieldWrapper'
import FormFieldWrapper from '~/features/form-builder/components/FormFieldWrapper.vue'

interface Props {
  modelValue?: boolean
  errors: string[]
  meta: ToggleFieldMeta
  name: string
  onBlur?: (e?: Event) => void
}

const props = defineProps<Props>()
const emit = defineEmits<{
  'update:modelValue': [value: boolean]
}>()

const { wrapperProps } = useFieldWrapper(props.meta, props.name, () => props.errors, {
  orientation: 'horizontal'
})

const handleChange = (value: boolean) => {
  emit('update:modelValue', value)
}
</script>

<template>
  <FormFieldWrapper v-bind="wrapperProps">
    <Switch
      :id="name"
      :model-value="modelValue"
      :class="meta.class"
      @update:model-value="handleChange"
    />
  </FormFieldWrapper>
</template>
