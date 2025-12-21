<script setup lang="ts">
import { ref, computed, provide } from 'vue'
import { cn } from '@/lib/utils'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Field, FieldLegend, FieldDescription } from '@/components/ui/field'
import { Badge } from '@/components/ui/badge'
import type { TabsFieldMeta } from '~/features/form-builder/form-builder-types'
import { getRecordAtPath } from '~/features/form-builder/field-path-utils'
import { useFormBuilderContext } from '~/features/form-builder/composables/useFormBuilderContext'
import { useFieldVisibility } from '~/features/form-builder/composables/useFieldVisibility'
import { useContainerFieldPaths } from '~/features/form-builder/composables/useContainerFieldPaths'
import { resolveText } from '~/features/form-builder/composables/useResolvedFieldMeta'
import FormField from '../FormField.vue'
import { useChildFieldErrors } from '../composables/useChildFieldErrors'

interface Props {
  meta: TabsFieldMeta
  name: string
}

const props = defineProps<Props>()

// Inject common form builder context
const {
  sectionId,
  fieldPrefix: parentFieldPrefix,
  formValues,
  parentGroupVisible
} = useFormBuilderContext()

// Compute visibility for this tabs field
const isTabsVisible = useFieldVisibility(props.meta, formValues, parentGroupVisible)

provide('parentGroupVisible', () => isTabsVisible.value)

// Active tab state - initialize from defaultValue or first tab
const activeTab = ref(props.meta.defaultValue || props.meta.tabs[0]?.value || '')

// Compute paths for this container field
const {
  relativePath: tabsPath,
  currentFieldPrefix,
  fullPath: fullTabsPath
} = useContainerFieldPaths(props.name, sectionId, parentFieldPrefix)

provide('fieldPrefix', currentFieldPrefix.value)

// Check if each tab has validation errors in its child fields
const tabHasErrors = (tabValue: string) => {
  const tabPath = computed(() => `${fullTabsPath.value}.${tabValue}`)
  const { hasChildErrors } = useChildFieldErrors(tabPath)
  return { hasChildErrors }
}

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

const resolvedLabel = computed(() => resolveText(props.meta.label, formValues.value))

// Resolve tab labels using utility
const resolveTabLabel = (tab: (typeof props.meta.tabs)[number]) => {
  return resolveText(tab.label, formValues.value)
}

// Resolve tab badge labels using utility
const resolveTabBadge = (tab: (typeof props.meta.tabs)[number]) => {
  return resolveText(tab.badgeLabel, formValues.value)
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

      <Tabs v-model="activeTab" :unmount-on-hide="false">
        <TabsList :class="cn(meta.tabsListClass)">
          <TabsTrigger v-for="tab in meta.tabs" :key="tab.value" :value="tab.value" class="gap-2">
            {{ resolveTabLabel(tab) }}
            <!-- Error badge takes priority -->
            <Badge
              v-if="tabHasErrors(tab.value).hasChildErrors.value"
              variant="destructive"
              class="ml-1 h-5 px-1.5 text-xs gap-1"
            >
              <Icon name="lucide:alert-circle" class="h-3 w-3" />
            </Badge>
            <!-- Custom badge shown when no errors -->
            <Badge
              v-else-if="resolveTabBadge(tab)"
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
