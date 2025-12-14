<script setup lang="ts">
import { computed, watch, provide, ref, nextTick } from 'vue'
import { toTypedSchema } from '@vee-validate/zod'
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

// Setup form with validation
const { values, setValues, meta, handleSubmit } = useForm({
  validationSchema: toTypedSchema(props.section.schema),
  initialValues: props.modelValue
})

// Provide form values to child fields for conditional visibility
provide('formValues', () => values as Record<string, unknown>)

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

// Emit changes
watch(
  values,
  (newValues: Record<string, unknown>) => {
    emit('update:modelValue', newValues)
  },
  { deep: true }
)

// Expose validation state
const isValid = computed(() => meta.value.valid)

// Handle form submission
const onSubmit = handleSubmit(() => {
  emit('submit')
})

// Group fields by visibility to create visual sections
const visibleFields = computed(() => {
  const formVals = values as Record<string, unknown>
  return Object.entries(props.section.fields).filter(([, fieldMeta]) => {
    if (!fieldMeta.visibleWhen) return true
    return fieldMeta.visibleWhen(formVals)
  })
})

// Auto-scroll when new fields become visible
watch(
  visibleFields,
  (newFields, oldFields) => {
    // Find newly visible fields
    const oldKeys = new Set(oldFields?.map(([key]) => key) || [])
    const newlyVisible = newFields.filter(([key]) => !oldKeys.has(key))

    if (newlyVisible.length > 0) {
      // Scroll to the last newly visible field after 200ms
      const lastField = newlyVisible[newlyVisible.length - 1]
      if (lastField) {
        const lastFieldKey = lastField[0]

        setTimeout(() => {
          nextTick(() => {
            const fieldElement = fieldRefs.value[lastFieldKey]
            if (fieldElement) {
              fieldElement.scrollIntoView({ behavior: 'smooth', block: 'end' })
            }
          })
        }, 200)
      }
    }
  },
  { deep: true }
)

// Group consecutive col-span-1 fields together
const fieldGroups = computed(() => {
  const groups: Array<{ isGrid: boolean; fields: Array<[string, FieldMeta]> }> = []
  let currentGroup: Array<[string, FieldMeta]> = []
  let isCurrentGroupGrid = false

  visibleFields.value.forEach(([key, fieldMeta]) => {
    const isGridField = fieldMeta.class?.includes('col-span-1')

    if (isGridField) {
      // Start or continue a grid group
      if (!isCurrentGroupGrid && currentGroup.length > 0) {
        // Save previous non-grid group
        groups.push({ isGrid: false, fields: currentGroup })
        currentGroup = []
      }
      isCurrentGroupGrid = true
      currentGroup.push([key, fieldMeta])
    } else {
      // Non-grid field
      if (isCurrentGroupGrid && currentGroup.length > 0) {
        // Save previous grid group
        groups.push({ isGrid: true, fields: currentGroup })
        currentGroup = []
      }
      isCurrentGroupGrid = false
      currentGroup.push([key, fieldMeta])
    }
  })

  // Save last group
  if (currentGroup.length > 0) {
    groups.push({ isGrid: isCurrentGroupGrid, fields: currentGroup })
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
      <div v-if="group.isGrid" class="grid grid-cols-2 gap-3">
        <div
          v-for="([fieldKey, fieldMeta], index) in group.fields"
          :key="`${fieldKey}-${index}`"
          :ref="(el) => setFieldRef(String(fieldKey), el as HTMLElement | null)"
        >
          <FormField :name="String(fieldKey)" :meta="fieldMeta" />
        </div>
      </div>
      <template v-else>
        <div
          v-for="([fieldKey, fieldMeta], index) in group.fields"
          :key="`${fieldKey}-${index}`"
          :ref="(el) => setFieldRef(String(fieldKey), el as HTMLElement | null)"
        >
          <FormField :name="String(fieldKey)" :meta="fieldMeta" />
        </div>
      </template>
    </template>
  </form>
</template>
