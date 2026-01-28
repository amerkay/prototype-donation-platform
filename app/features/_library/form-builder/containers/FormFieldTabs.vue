<script setup lang="ts">
import { ref, computed } from 'vue'
import { cn } from '@/lib/utils'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Field, FieldLegend, FieldDescription } from '@/components/ui/field'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import type { TabsFieldDef, TabDefinitionConfig } from '~/features/_library/form-builder/types'
import {
  useResolvedFieldMeta,
  resolveText
} from '~/features/_library/form-builder/composables/useResolvedFieldMeta'
import { useContainerFieldSetup } from '~/features/_library/form-builder/composables/useContainerFieldSetup'
import { useCombinedErrors } from '~/features/_library/form-builder/composables/useCombinedErrors'
import { useContainerValidation } from '~/features/_library/form-builder/composables/useContainerValidation'
import FormFieldGroup from './FormFieldGroup.vue'

interface Props {
  meta: TabsFieldDef
  name: string
}

const props = defineProps<Props>()

// Use unified container setup composable for tabs visibility and scoped values
const {
  isVisible: isTabsVisible,
  fullPath: fullTabsPath,
  scopedFormValues
} = useContainerFieldSetup(props.name, props.meta.visibleWhen)

// Active tab state - initialize from defaultValue or first tab
const activeTab = ref(props.meta.defaultValue || props.meta.tabs[0]?.value || '')

// Compute combined errors for each tab using lightweight composable
const tabErrorTrackers = Object.fromEntries(
  props.meta.tabs.map((tab: TabDefinitionConfig) => {
    const tabPath = computed(() => `${fullTabsPath.value}.${tab.value}`)

    // Create scoped context for this specific tab
    const tabScopedValues = computed(() => {
      const parentValues = scopedFormValues.value.values as Record<string, unknown> | undefined
      const tabValues = (parentValues?.[tab.value] as Record<string, unknown>) || {}
      return {
        values: tabValues,
        parent: parentValues,
        root: scopedFormValues.value.root
      }
    })

    // Tabs-level rules are validated separately (not per-tab)
    const hasErrors = useCombinedErrors(tabPath, tab.fields, tabScopedValues)
    return [tab.value, hasErrors]
  })
)

// Check if a tab has validation errors (uses cached tracker)
const tabHasErrors = (tabValue: string) => {
  return tabErrorTrackers[tabValue]?.value ?? false
}

const resolvedLabel = computed(() => resolveText(props.meta.label, scopedFormValues.value))

// Resolve class from meta
const { resolvedClass } = useResolvedFieldMeta(props.meta)

// Validate container-level rules if defined
const { containerErrors } = useContainerValidation(
  fullTabsPath,
  props.meta.rules,
  scopedFormValues,
  () => isTabsVisible.value
)

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
    <Field :class="cn(resolvedClass, 'space-y-1')">
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
              :meta="{ type: 'field-group', name: tab.value, fields: tab.fields }"
            />
          </Card>
        </TabsContent>
      </Tabs>

      <!-- Display container-level validation errors -->
      <div v-if="containerErrors.length > 0" class="mt-3 text-sm text-destructive">
        <p v-for="(error, idx) in containerErrors" :key="idx">{{ error }}</p>
      </div>
    </Field>
  </div>
</template>
