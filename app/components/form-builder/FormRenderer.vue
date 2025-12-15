<script setup lang="ts">
import { computed, watch, watchEffect, provide, ref, nextTick } from 'vue'
import { useForm } from 'vee-validate'
import FormField from './FormField.vue'
import type { ConfigSectionDef, FieldMeta } from '@/lib/form-builder/types'

interface Props {
  section: ConfigSectionDef
  modelValue: Record<string, unknown>
  class?: string
}

const props = defineProps<Props>()

const emit = defineEmits<{
  'update:modelValue': [value: Record<string, unknown>]
  submit: []
}>()

// Use the composition API to access form context
const { values, meta, setValues, handleSubmit } = useForm({
  initialValues: props.modelValue,
  validateOnMount: false
})

// Provide form values to child fields for conditional visibility
provide('formValues', () => values as Record<string, unknown>)

// Provide submit function for Enter key handling in text fields
provide('submitForm', () => {
  onSubmit()
})

// Track field refs for auto-scroll functionality
const fieldRefs = ref<Record<string, HTMLElement | null>>({})

const setFieldRef = (fieldKey: string, el: HTMLElement | null) => {
  fieldRefs.value[fieldKey] = el
}

// Watch for external changes to modelValue
watch(
  () => props.modelValue,
  (newValue) => {
    setValues(newValue)
  },
  { deep: true }
)

// Emit changes when form values update
watchEffect(() => {
  const currentValues = values as Record<string, unknown>
  emit('update:modelValue', currentValues)
})

// Handle form submission
const onSubmit = handleSubmit((submittedValues) => {
  emit('update:modelValue', submittedValues)
  emit('submit')
})

// Expose validation state
const isValid = computed(() => meta.value.valid)

// All fields - we render all of them, visibility is handled by FormField
const allFields = computed(() => {
  return Object.entries(props.section.fields)
})

// Helper to check if a field is visible
const isFieldVisible = (fieldMeta: FieldMeta) => {
  if (!fieldMeta.visibleWhen) return true
  return fieldMeta.visibleWhen(values as Record<string, unknown>)
}

// Track which fields are currently visible for auto-scroll
const visibleFieldKeys = computed(() => {
  return Object.entries(props.section.fields)
    .filter(([, fieldMeta]) => isFieldVisible(fieldMeta))
    .map(([key]) => key)
})

// Auto-scroll when new fields become visible
watch(
  visibleFieldKeys,
  async (newKeys, oldKeys) => {
    // Find newly visible fields for auto-scroll
    const oldKeySet = new Set(oldKeys || [])
    const newlyVisible = newKeys.filter((key) => !oldKeySet.has(key))

    if (newlyVisible.length > 0) {
      // Scroll to the last newly visible field after a delay
      const lastFieldKey = newlyVisible[newlyVisible.length - 1]
      if (lastFieldKey) {
        setTimeout(() => {
          nextTick(() => {
            const fieldElement = fieldRefs.value[lastFieldKey]
            if (fieldElement) {
              const rect = fieldElement.getBoundingClientRect()
              const scrollContainer = fieldElement.closest(
                '[data-radix-scroll-area-viewport], .overflow-y-auto, .overflow-auto'
              )
              if (scrollContainer) {
                const containerRect = scrollContainer.getBoundingClientRect()
                const scrollTop = scrollContainer.scrollTop + rect.bottom - containerRect.top + 75
                scrollContainer.scrollTo({ top: scrollTop, behavior: 'smooth' })
              }
            }
          })
        }, 300)
      }
    }
  },
  { deep: true }
)

// Group consecutive col-span-1 fields together
const fieldGroups = computed(() => {
  const groups: Array<{
    isGrid: boolean
    fields: Array<[string, FieldMeta]>
    hasVisibleFields: boolean
  }> = []
  let currentGroup: Array<[string, FieldMeta]> = []
  let isCurrentGroupGrid = false

  allFields.value.forEach(([key, fieldMeta]) => {
    const isGridField = fieldMeta.class?.includes('col-span-1')

    if (isGridField) {
      // Start or continue a grid group
      if (!isCurrentGroupGrid && currentGroup.length > 0) {
        // Save previous non-grid group
        groups.push({
          isGrid: false,
          fields: currentGroup,
          hasVisibleFields: currentGroup.some(([, meta]) => isFieldVisible(meta))
        })
        currentGroup = []
      }
      isCurrentGroupGrid = true
      currentGroup.push([key, fieldMeta])
    } else {
      // Non-grid field
      if (isCurrentGroupGrid && currentGroup.length > 0) {
        // Save previous grid group
        groups.push({
          isGrid: true,
          fields: currentGroup,
          hasVisibleFields: currentGroup.some(([, meta]) => isFieldVisible(meta))
        })
        currentGroup = []
      }
      isCurrentGroupGrid = false
      currentGroup.push([key, fieldMeta])
    }
  })

  // Save last group
  if (currentGroup.length > 0) {
    groups.push({
      isGrid: isCurrentGroupGrid,
      fields: currentGroup,
      hasVisibleFields: currentGroup.some(([, meta]) => isFieldVisible(meta))
    })
  }

  return groups
})

defineExpose({
  isValid,
  onSubmit
})
</script>

<template>
  <form :class="['space-y-6', props.class]" @submit.prevent="onSubmit">
    <template v-for="(group, groupIndex) in fieldGroups" :key="`group-${groupIndex}`">
      <div v-show="group.isGrid && group.hasVisibleFields" class="grid grid-cols-2 gap-3">
        <div
          v-for="([fieldKey, fieldMeta], index) in group.fields"
          v-show="isFieldVisible(fieldMeta)"
          :key="`${fieldKey}-${index}`"
          :ref="(el) => setFieldRef(String(fieldKey), el as HTMLElement | null)"
        >
          <FormField :name="String(fieldKey)" :meta="fieldMeta" />
        </div>
      </div>
      <template v-if="!group.isGrid">
        <div
          v-for="([fieldKey, fieldMeta], index) in group.fields"
          v-show="isFieldVisible(fieldMeta)"
          :key="`${fieldKey}-${index}`"
          :ref="(el) => setFieldRef(String(fieldKey), el as HTMLElement | null)"
        >
          <FormField :name="String(fieldKey)" :meta="fieldMeta" />
        </div>
      </template>
    </template>
  </form>
</template>
