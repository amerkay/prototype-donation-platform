<script setup lang="ts">
import { computed, type Component } from 'vue'
import { cn } from '@/lib/utils'
import type { ComponentFieldDef, FieldProps } from '~/features/_library/form-builder/types'
import { useFieldWrapper } from '~/features/_library/form-builder/composables/useFieldWrapper'
import FormFieldWrapper from '~/features/_library/form-builder/internal/FormFieldWrapper.vue'

type Props = FieldProps<unknown, ComponentFieldDef>

const props = defineProps<Props>()

const emit = defineEmits<{
  'update:modelValue': [value: unknown]
}>()

// Use field wrapper composable for standardized props
const { wrapperProps, resolvedClass, resolvedDisabled } = useFieldWrapper(
  props.meta,
  props.name,
  () => props.errors,
  {
    disableLabelFor: true
  },
  () => props.fullPath
)

// Resolve additional props (static or dynamic)
const resolvedProps = computed(() => {
  if (!props.meta.props) return {}

  if (typeof props.meta.props === 'function') {
    // For function props, we can't easily call it without FieldContext
    // Return empty for now (could be enhanced later)
    return {}
  }

  // Return static props
  return props.meta.props
})

// Handle value updates from child component
function handleUpdate(value: unknown) {
  emit('update:modelValue', value)
}

// Get component to render
const component = computed(() => props.meta.component as Component)
</script>

<template>
  <FormFieldWrapper v-bind="wrapperProps" :class="props.class">
    <!-- Render the custom component with v-model binding -->
    <div :class="cn('mt-2', resolvedClass)">
      <component
        :is="component"
        :model-value="props.modelValue"
        v-bind="resolvedProps"
        :disabled="resolvedDisabled"
        @update:model-value="handleUpdate"
      />
    </div>
  </FormFieldWrapper>
</template>
