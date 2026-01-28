<script setup lang="ts">
import { computed, type Component } from 'vue'
import { cn } from '@/lib/utils'
import type { ComponentFieldDef, FieldProps } from '~/features/_library/form-builder/types'
import { useFieldWrapper } from '~/features/_library/form-builder/composables/useFieldWrapper'
import FormFieldWrapper from '~/features/_library/form-builder/internal/FormFieldWrapper.vue'

type Props = FieldProps<unknown, ComponentFieldDef>

const props = defineProps<Props>()

// Use field wrapper composable for standardized props
const { wrapperProps, resolvedClass } = useFieldWrapper(
  props.meta,
  props.name,
  () => props.errors,
  {
    disableLabelFor: true
  }
)

// Resolve component props (static or dynamic)
const resolvedProps = computed(() => {
  // modelValue contains the injected validation data (like formsCount)
  // Merge with any static props defined in meta
  const injectedData = (props.modelValue as Record<string, unknown>) || {}

  if (!props.meta.props) return injectedData

  if (typeof props.meta.props === 'function') {
    // For function props, we can't easily call it without FieldContext
    // Just return the injected data for now
    return injectedData
  }

  // Merge static props with injected data
  return { ...props.meta.props, ...injectedData }
})

// Get component to render
const component = computed(() => props.meta.component as Component)
</script>

<template>
  <FormFieldWrapper v-bind="wrapperProps" :class="props.class">
    <!-- Render the custom component -->
    <div :class="cn('mt-2', resolvedClass)">
      <component :is="component" v-bind="resolvedProps" />
    </div>
  </FormFieldWrapper>
</template>
