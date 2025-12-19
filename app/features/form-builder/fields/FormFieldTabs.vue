<script setup lang="ts">
import { ref, computed, watch, inject, provide } from 'vue'
import { cn } from '@/lib/utils'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Field, FieldLegend, FieldDescription, FieldError } from '@/components/ui/field'
import { Badge } from '@/components/ui/badge'
import type { TabsFieldMeta, VeeFieldContext } from '~/features/form-builder/form-builder-types'
import FormField from '../FormField.vue'

interface Props {
  field: VeeFieldContext
  errors: string[]
  meta: TabsFieldMeta
  name: string
  onFieldChange?: (value: unknown, fieldOnChange: (value: unknown) => void) => void
}

const props = defineProps<Props>()

// Get form values for dynamic label/badge resolution
const getFormValues = inject<() => Record<string, unknown>>('formValues', () => ({}))

// Inject parent visibility for conditional rendering
const parentGroupVisible = inject<() => boolean>('parentGroupVisible', () => true)

// Computed visibility for this tabs field
const isTabsVisible = computed(() => {
  if (!parentGroupVisible()) return false
  if (!props.meta.visibleWhen) return true
  return props.meta.visibleWhen(getFormValues())
})

provide('parentGroupVisible', () => isTabsVisible.value)

// Active tab state - initialize from defaultValue or first tab
const activeTab = ref(props.meta.defaultValue || props.meta.tabs[0]?.value || '')

// Watch for tab changes and initialize nested field values if needed
watch(
  activeTab,
  (newTab) => {
    // Ensure field values for this tab exist (initialize if needed)
    const currentValue = props.field.value as Record<string, unknown> | undefined
    if (!currentValue || typeof currentValue !== 'object') {
      // Initialize with empty object for the active tab
      const initialValue = { [newTab]: {} }
      if (props.onFieldChange) {
        props.onFieldChange(initialValue, props.field.onChange)
      } else {
        props.field.onChange(initialValue)
      }
    }
  },
  { immediate: true }
)

// Extract field key from full name path
const fieldKey = computed(() => {
  const parts = props.name.split('.')
  return parts[parts.length - 1] || ''
})

// Field prefix context for nested paths
const parentFieldPrefix = inject<string>('fieldPrefix', '')
const currentFieldPrefix = computed(() => {
  return parentFieldPrefix ? `${parentFieldPrefix}.${fieldKey.value}` : fieldKey.value
})

provide('fieldPrefix', currentFieldPrefix.value)

// Create a reactive ref for the currently active tab data
// This will be updated when the active tab changes
const currentTabData = computed(() => {
  const fullValues = getFormValues()
  const tabsValue = props.field.value as Record<string, unknown> | undefined
  const tabData = tabsValue?.[activeTab.value] as Record<string, unknown> | undefined
  return { ...fullValues, ...(tabData || {}) }
})

// Provide scoped form values that update based on active tab
provide('formValues', () => currentTabData.value)

// Resolve label (static string or function)
const resolvedLabel = computed(() => {
  if (!props.meta.label) return undefined
  if (typeof props.meta.label === 'function') {
    return props.meta.label(getFormValues())
  }
  return props.meta.label
})

// Resolve tab labels
const resolveTabLabel = (tab: (typeof props.meta.tabs)[number]) => {
  if (typeof tab.label === 'function') {
    return tab.label(getFormValues())
  }
  return tab.label
}

// Resolve tab badge labels
const resolveTabBadge = (tab: (typeof props.meta.tabs)[number]) => {
  if (!tab.badgeLabel) return undefined
  if (typeof tab.badgeLabel === 'function') {
    return tab.badgeLabel(getFormValues())
  }
  return tab.badgeLabel
}

// Watch for external field value changes
watch(
  () => props.field.value,
  (newValue) => {
    if (newValue && typeof newValue === 'object' && !Array.isArray(newValue)) {
      // If we have data for a different tab, switch to it
      const availableTabs = Object.keys(newValue)
      const firstTab = availableTabs[0]
      if (firstTab && availableTabs.length > 0 && !availableTabs.includes(activeTab.value)) {
        activeTab.value = firstTab
      }
    }
  },
  { deep: true }
)
</script>

<template>
  <Field :data-invalid="!!errors.length" :class="cn(meta.class, 'space-y-3')">
    <FieldLegend v-if="resolvedLabel" :class="meta.labelClass">
      {{ resolvedLabel }}
    </FieldLegend>
    <FieldDescription v-if="meta.description" :class="meta.descriptionClass">
      {{ meta.description }}
    </FieldDescription>

    <Tabs v-model="activeTab" class="w-full">
      <TabsList>
        <TabsTrigger v-for="tab in meta.tabs" :key="tab.value" :value="tab.value" class="gap-2">
          {{ resolveTabLabel(tab) }}
          <Badge
            v-if="resolveTabBadge(tab)"
            :variant="tab.badgeVariant || 'secondary'"
            class="ml-1 h-5 px-1.5 text-xs"
          >
            {{ resolveTabBadge(tab) }}
          </Badge>
        </TabsTrigger>
      </TabsList>

      <TabsContent
        v-for="tab in meta.tabs"
        :key="tab.value"
        :value="tab.value"
        class="space-y-4 mt-4"
      >
        <FormField
          v-for="[fieldName, fieldMeta] in Object.entries(tab.fields)"
          :key="fieldName"
          :name="`${name}.${tab.value}.${fieldName}`"
          :meta="fieldMeta"
        />
      </TabsContent>
    </Tabs>

    <FieldError v-if="errors.length" :errors="errors.slice(0, 1)" />
  </Field>
</template>
