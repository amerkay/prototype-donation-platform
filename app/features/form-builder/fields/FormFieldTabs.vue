<script setup lang="ts">
import { ref, computed, provide } from 'vue'
import { cn } from '@/lib/utils'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Field, FieldLegend, FieldDescription } from '@/components/ui/field'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import type { TabsFieldMeta, FieldGroupMeta } from '~/features/form-builder/form-builder-types'
import { getRecordAtPath } from '~/features/form-builder/field-path-utils'
import { useFormBuilderContext } from '~/features/form-builder/composables/useFormBuilderContext'
import { useFieldVisibility } from '~/features/form-builder/composables/useFieldVisibility'
import { useContainerFieldPaths } from '~/features/form-builder/composables/useContainerFieldPaths'
import { resolveText } from '~/features/form-builder/composables/useResolvedFieldMeta'
import { useChildFieldErrors } from '../composables/useChildFieldErrors'
import FormFieldGroup from './FormFieldGroup.vue'

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
const isTabsVisible = useFieldVisibility(props.meta, parentGroupVisible)

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

// Provide scoped form values to child fields (as ComputedRef for reactivity)
// This ensures child FormFieldGroup components can find tab data at the correct path
const scopedFormValues = computed(() => {
  const fullValues = formValues.value
  const tabsValue = getRecordAtPath(fullValues, tabsPath.value)
  return { ...fullValues, ...(tabsValue || {}) }
})
provide('scopedFormValues', scopedFormValues)

// Check if each tab has validation errors in its child fields
const tabHasErrors = (tabValue: string) => {
  const tabPath = computed(() => `${fullTabsPath.value}.${tabValue}`)
  const { hasChildErrors } = useChildFieldErrors(tabPath)
  return { hasChildErrors }
}

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
      <FieldLegend v-if="resolvedLabel" :class="cn('mb-0', meta.labelClass)">
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

        <TabsContent v-for="tab in meta.tabs" :key="tab.value" :value="tab.value">
          <Card class="px-4 bg-muted/50">
            <FormFieldGroup
              :name="tab.value"
              :meta="{ type: 'field-group', fields: tab.fields } as FieldGroupMeta"
            />
          </Card>
        </TabsContent>
      </Tabs>
    </Field>
  </div>
</template>
