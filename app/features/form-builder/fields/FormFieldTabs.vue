<script setup lang="ts">
import { ref, computed, inject, provide, type ComputedRef } from 'vue'
import { cn } from '@/lib/utils'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Field, FieldLegend, FieldDescription } from '@/components/ui/field'
import { Badge } from '@/components/ui/badge'
import type { TabsFieldMeta } from '~/features/form-builder/form-builder-types'
import {
  getRecordAtPath,
  joinPath,
  toSectionRelativePath
} from '~/features/form-builder/field-path-utils'
import FormField from '../FormField.vue'

interface Props {
  meta: TabsFieldMeta
  name: string
}

const props = defineProps<Props>()

const sectionId = inject<string>('sectionId', '')

// Get form values for dynamic label/badge resolution (as ComputedRef for reactivity)
const formValues = inject<ComputedRef<Record<string, unknown>>>(
  'formValues',
  computed(() => ({}))
)

// Inject parent visibility for conditional rendering
const parentGroupVisible = inject<() => boolean>('parentGroupVisible', () => true)

// Computed visibility for this tabs field
const isTabsVisible = computed(() => {
  if (!parentGroupVisible()) return false
  if (!props.meta.visibleWhen) return true
  return props.meta.visibleWhen(formValues.value)
})

provide('parentGroupVisible', () => isTabsVisible.value)

// Active tab state - initialize from defaultValue or first tab
const activeTab = ref(props.meta.defaultValue || props.meta.tabs[0]?.value || '')

// Normalize to section-relative path
const tabsPath = computed(() => {
  return toSectionRelativePath(props.name, sectionId)
})

// Field prefix context for nested paths
const parentFieldPrefix = inject<string>('fieldPrefix', '')
const currentFieldPrefix = computed(() => {
  return joinPath(parentFieldPrefix, tabsPath.value)
})

provide('fieldPrefix', currentFieldPrefix.value)

// Provide scoped form values to child fields (as ComputedRef for reactivity)
// This merges the full form values with the current tab's data
// so that visibleWhen conditions inside tabs can access tab-local field values
const scopedFormValues = computed(() => {
  const fullValues = formValues.value
  const tabsValue = getRecordAtPath(fullValues, tabsPath.value) as
    | Record<string, unknown>
    | undefined
  const currentTabData = tabsValue?.[activeTab.value] as Record<string, unknown> | undefined
  return { ...fullValues, ...(currentTabData || {}) }
})
provide('formValues', scopedFormValues)

const resolvedLabel = computed(() =>
  typeof props.meta.label === 'function' ? props.meta.label(formValues.value) : props.meta.label
)

// Resolve tab labels
const resolveTabLabel = (tab: (typeof props.meta.tabs)[number]) => {
  return typeof tab.label === 'function' ? tab.label(formValues.value) : tab.label
}

// Resolve tab badge labels
const resolveTabBadge = (tab: (typeof props.meta.tabs)[number]) => {
  if (!tab.badgeLabel) return undefined
  return typeof tab.badgeLabel === 'function' ? tab.badgeLabel(formValues.value) : tab.badgeLabel
}
</script>

<template>
  <div v-show="isTabsVisible">
    <Field :class="cn(meta.class, 'space-y-3')">
      <FieldLegend v-if="resolvedLabel" :class="meta.labelClass">
        {{ resolvedLabel }}
      </FieldLegend>
      <FieldDescription v-if="meta.description" :class="meta.descriptionClass">
        {{ meta.description }}
      </FieldDescription>

      <Tabs v-model="activeTab">
        <TabsList :class="cn(meta.tabsListClass)">
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
            :name="`${tab.value}.${fieldName}`"
            :meta="fieldMeta"
          />
        </TabsContent>
      </Tabs>
    </Field>
  </div>
</template>
