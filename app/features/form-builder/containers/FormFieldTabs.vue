<script setup lang="ts">
import { ref, computed } from 'vue'
import { cn } from '@/lib/utils'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Field, FieldLegend, FieldDescription } from '@/components/ui/field'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import type { TabsFieldMeta, FieldGroupMeta } from '~/features/form-builder/types'
import { resolveText } from '~/features/form-builder/composables/useResolvedFieldMeta'
import { useContainerFieldSetup } from '~/features/form-builder/composables/useContainerFieldSetup'
import { useCachedChildErrors } from '../composables/useCachedChildErrors'
import FormFieldGroup from './FormFieldGroup.vue'

interface Props {
  meta: TabsFieldMeta
  name: string
}

const props = defineProps<Props>()

// Use unified container setup composable
const {
  isVisible: isTabsVisible,
  fullPath: fullTabsPath,
  scopedFormValues
} = useContainerFieldSetup(props.name, props.meta.visibleWhen)

// Active tab state - initialize from defaultValue or first tab
const activeTab = ref(props.meta.defaultValue || props.meta.tabs[0]?.value || '')

// Pre-compute error tracking for all tabs with caching
// This is initialized once and caches errors for each tab independently
const tabErrorTrackers = Object.fromEntries(
  props.meta.tabs.map((tab) => {
    const tabPath = computed(() => `${fullTabsPath.value}.${tab.value}`)
    const isTabActive = computed(() => activeTab.value === tab.value)

    // Create tab-specific scoped values - must be scoped to the tab's values, not the parent
    const tabScopedFormValues = computed(() => {
      const parentValues = scopedFormValues.value.values as Record<string, unknown> | undefined
      const tabValues = parentValues?.[tab.value] as Record<string, unknown> | undefined
      return {
        values: tabValues || {},
        parent: parentValues,
        root: scopedFormValues.value.root
      }
    })

    const { hasChildErrors } = useCachedChildErrors(tabPath, isTabActive, {
      fields: tab.fields,
      scopedFormValues: tabScopedFormValues
    })
    return [tab.value, hasChildErrors]
  })
)

// Check if a tab has validation errors (uses cached tracker)
const tabHasErrors = (tabValue: string) => {
  return tabErrorTrackers[tabValue]?.value ?? false
}

const resolvedLabel = computed(() => resolveText(props.meta.label, scopedFormValues.value))

// Resolve tab labels using utility
const resolveTabLabel = (tab: (typeof props.meta.tabs)[number]) => {
  return resolveText(tab.label, scopedFormValues.value)
}

// Resolve tab badge labels using utility
const resolveTabBadge = (tab: (typeof props.meta.tabs)[number]) => {
  return resolveText(tab.badgeLabel, scopedFormValues.value)
}
</script>

<template>
  <div v-show="isTabsVisible">
    <Field :class="cn(meta.class, 'space-y-1')">
      <FieldLegend v-if="resolvedLabel" :class="cn('mb-0', meta.labelClass)">
        {{ resolvedLabel }}
      </FieldLegend>
      <FieldDescription v-if="meta.description" :class="meta.descriptionClass">
        {{ meta.description }}
      </FieldDescription>

      <Tabs v-model="activeTab" :unmount-on-hide="true">
        <TabsList :class="cn('w-full', meta.tabsListClass)">
          <TabsTrigger v-for="tab in meta.tabs" :key="tab.value" :value="tab.value" class="gap-2">
            {{ resolveTabLabel(tab) }}
            <!-- Error badge takes priority -->
            <Badge
              v-if="tabHasErrors(tab.value)"
              variant="destructive"
              class="ml-1 size-5 p-0 text-xs gap-1"
            >
              <Icon name="lucide:alert-circle" />
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
