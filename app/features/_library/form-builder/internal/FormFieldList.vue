<script setup lang="ts">
import { computed, type HTMLAttributes } from 'vue'
import { FieldSeparator } from '@/components/ui/field'
import { checkFieldVisibility } from '~/features/_library/form-builder/composables/useFieldPath'
import type { FieldDef, FieldContext } from '~/features/_library/form-builder/types'
import FormField from '../FormField.vue'
import { cn } from '@/lib/utils'

interface Props {
  fields: Record<string, FieldDef>
  fieldContext: FieldContext
  namePrefix?: string
  class?: HTMLAttributes['class']
  /**
   * Optional callback to set element refs for scroll tracking
   */
  setElementRef?: (key: string, el: HTMLElement | null) => void
}

const props = defineProps<Props>()

// All fields for iteration
const allFields = computed(() => Object.entries(props.fields))

// Check if a field is visible in the UI (not just for validation)
// Skip container validation to get actual UI visibility, not validation visibility
const isFieldVisible = (fieldDef: FieldDef) => {
  return checkFieldVisibility(fieldDef, props.fieldContext, { skipContainerValidation: true })
}

// Check if separator should be shown after a field
const shouldShowSeparatorAfter = (currentIndex: number, currentFieldDef: FieldDef) => {
  // Only show separator if current field is visible and has the flag
  const sep = currentFieldDef.showSeparatorAfter
  const hasSeparator = typeof sep === 'function' ? sep(props.fieldContext) : sep
  if (!isFieldVisible(currentFieldDef) || !hasSeparator) {
    return false
  }

  // Check if there's any visible field after this one
  const hasVisibleFieldAfter = allFields.value
    .slice(currentIndex + 1)
    .some(([, fieldDef]) => isFieldVisible(fieldDef))

  return hasVisibleFieldAfter
}

// Construct field name (with optional prefix for nested contexts)
const getFieldName = (fieldKey: string) => {
  return props.namePrefix ? `${props.namePrefix}.${fieldKey}` : fieldKey
}
</script>

<template>
  <div :class="cn('grid grid-cols-1 gap-5', props.class)">
    <template v-for="([fieldKey, fieldDef], index) in allFields" :key="`${fieldKey}-${index}`">
      <FormField
        :ref="(el) => setElementRef?.(String(fieldKey), el as HTMLElement | null)"
        :name="getFieldName(fieldKey)"
        :meta="fieldDef"
      />
      <FieldSeparator v-if="shouldShowSeparatorAfter(index, fieldDef)" />
    </template>
  </div>
</template>
