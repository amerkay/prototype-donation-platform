<script setup lang="ts">
import { computed, inject, type HTMLAttributes } from 'vue'
import { FieldSeparator } from '@/components/ui/field'
import { checkFieldVisibility } from '~/features/_library/form-builder/composables/useFieldPath'
import type { FieldDef, FieldContext } from '~/features/_library/form-builder/types'
import { FORM_SEARCH_KEY } from '~/features/_library/form-builder/composables/useFormSearch'
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

// Inject form search state (optional — may not exist if search disabled)
const formSearch = inject(FORM_SEARCH_KEY, null)

// All fields for iteration
const allFields = computed(() => Object.entries(props.fields))

// Check if a field is visible in the UI (not just for validation)
// Combines visibleWhen check with search filter
const isFieldVisible = (fieldDef: FieldDef, fieldKey?: string) => {
  const baseVisible = checkFieldVisibility(fieldDef, props.fieldContext, {
    skipContainerValidation: true
  })
  if (!baseVisible) return false

  // Apply search filter if active
  if (formSearch?.isSearchActive.value && fieldKey) {
    const path = props.namePrefix ? `${props.namePrefix}.${fieldKey}` : fieldKey
    // Strip the section ID prefix for search matching (search index uses paths without section prefix)
    const sectionPrefix = path.split('.')[0] + '.'
    const searchPath = path.startsWith(sectionPrefix) ? path.slice(sectionPrefix.length) : path
    return formSearch.isFieldVisibleBySearch(searchPath)
  }

  return true
}

// Check if separator should be shown after a field
const shouldShowSeparatorAfter = (
  currentIndex: number,
  currentFieldDef: FieldDef,
  currentKey: string
) => {
  // Only show separator if current field is visible and has the flag
  const sep = currentFieldDef.showSeparatorAfter
  const hasSeparator = typeof sep === 'function' ? sep(props.fieldContext) : sep
  if (!isFieldVisible(currentFieldDef, currentKey) || !hasSeparator) {
    return false
  }

  // Check if there's any visible field after this one
  const hasVisibleFieldAfter = allFields.value
    .slice(currentIndex + 1)
    .some(([key, fieldDef]) => isFieldVisible(fieldDef, key))

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
        :data-field-key="fieldKey"
      />
      <FieldSeparator v-if="shouldShowSeparatorAfter(index, fieldDef, String(fieldKey))" />
    </template>
  </div>
</template>
