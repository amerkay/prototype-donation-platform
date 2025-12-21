<script setup lang="ts">
import { ref, watch, computed, inject, provide, type Ref } from 'vue'
import { cn } from '@/lib/utils'
import { FieldSet, FieldLegend, FieldDescription } from '@/components/ui/field'
import { AccordionItem, AccordionContent, AccordionTrigger } from '@/components/ui/accordion'
import { Badge } from '@/components/ui/badge'
import type { FieldGroupMeta } from '~/features/form-builder/form-builder-types'
import { getRecordAtPath } from '~/features/form-builder/field-path-utils'
import { useFormBuilderContext } from '~/features/form-builder/composables/useFormBuilderContext'
import { useFieldVisibility } from '~/features/form-builder/composables/useFieldVisibility'
import { useContainerFieldPaths } from '~/features/form-builder/composables/useContainerFieldPaths'
import { resolveText } from '~/features/form-builder/composables/useResolvedFieldMeta'
import FormField from '../FormField.vue'
import { useScrollOnVisible } from '../composables/useScrollOnVisible'
import { useChildFieldErrors } from '../composables/useChildFieldErrors'

interface Props {
  meta: FieldGroupMeta
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

// Get accordion state from parent (FormRenderer)
const accordionValue = inject<Ref<string | undefined>>('accordionValue', ref(undefined))
const isOpen = computed(() => accordionValue.value === props.name)

const resolvedLabel = computed(() => resolveText(props.meta.label, formValues.value))

// Set default open on mount if specified
if (props.meta.collapsibleDefaultOpen && !accordionValue.value) {
  accordionValue.value = props.name
}

// Setup scroll tracking for collapsible
const { setElementRef, scrollToElement } = useScrollOnVisible(
  computed(() => (isOpen.value ? [props.name] : [])),
  {
    isVisible: () => true,
    getKey: (key) => key
  }
)

// Compute visibility for this field group
const isGroupVisible = useFieldVisibility(props.meta, formValues, parentGroupVisible)

provide('parentGroupVisible', () => isGroupVisible.value)

// Compute paths for this container field
const {
  relativePath: groupPath,
  currentFieldPrefix,
  fullPath: fullGroupPath
} = useContainerFieldPaths(props.name, sectionId, parentFieldPrefix)

// Check if any child fields have validation errors
// Re-evaluate when accordion state changes to ensure fresh error state
const { hasChildErrors } = useChildFieldErrors(fullGroupPath)

// Provide the cumulative prefix to child fields
provide('fieldPrefix', currentFieldPrefix.value)

// Provide scoped form values to child fields (as ComputedRef for reactivity)
const scopedFormValues = computed(() => {
  const fullValues = formValues.value
  const groupValue = getRecordAtPath(fullValues, groupPath.value)
  return { ...fullValues, ...(groupValue || {}) }
})
provide('formValues', scopedFormValues)

// Watch accordion state changes
watch(isOpen, (newIsOpen) => {
  if (newIsOpen) {
    // Scroll to element and refresh error state
    scrollToElement(props.name)
  }
})
</script>

<template>
  <div v-show="isGroupVisible">
    <!-- Accordion Item version -->
    <template v-if="meta.collapsible">
      <AccordionItem
        :ref="(el: any) => setElementRef(props.name, el)"
        :value="name"
        :disabled="meta.isDisabled"
        :unmount-on-hide="false"
      >
        <AccordionTrigger
          class="hover:no-underline group py-0"
          :class="{ 'cursor-not-allowed opacity-60': meta.isDisabled }"
        >
          <div class="flex items-start justify-between w-full">
            <div class="flex-1 text-left">
              <div class="flex items-center gap-2">
                <h3
                  v-if="meta.legend || resolvedLabel"
                  :class="
                    cn(
                      meta.labelClass,
                      'font-medium text-sm',
                      !meta.isDisabled && 'group-hover:underline'
                    )
                  "
                >
                  {{ meta.legend || resolvedLabel }}
                </h3>
                <Badge
                  v-if="meta.badgeLabel"
                  :variant="meta.badgeVariant || 'secondary'"
                  class="text-xs"
                >
                  {{ meta.badgeLabel }}
                </Badge>
                <Badge v-if="hasChildErrors" variant="destructive" class="text-xs gap-1">
                  <Icon name="lucide:alert-circle" class="h-3 w-3" />
                  Error
                </Badge>
              </div>
              <p
                v-if="meta.description"
                :class="cn('text-muted-foreground text-xs mt-0.5', meta.descriptionClass)"
              >
                {{ meta.description }}
              </p>
            </div>
            <span v-if="!meta.isDisabled" class="text-sm text-muted-foreground">{{
              isOpen ? '' : 'Edit'
            }}</span>
          </div>
        </AccordionTrigger>
        <AccordionContent class="pt-4 pb-0">
          <div :class="cn('grid grid-cols-1 gap-3', meta.class)">
            <FormField
              v-for="([childFieldKey, fieldMeta], index) in Object.entries(meta.fields || {})"
              :key="`${childFieldKey}-${index}`"
              :name="childFieldKey"
              :meta="fieldMeta"
            />
          </div>
        </AccordionContent>
      </AccordionItem>
    </template>

    <!-- Non-collapsible version -->
    <FieldSet v-else class="gap-3">
      <FieldLegend v-if="meta.legend || resolvedLabel" :class="cn('', meta.labelClass)">{{
        meta.legend || resolvedLabel
      }}</FieldLegend>
      <FieldDescription v-if="meta.description" :class="meta.descriptionClass">
        {{ meta.description }}
      </FieldDescription>
      <div :class="cn('grid grid-cols-1 gap-3', meta.class)">
        <FormField
          v-for="([childFieldKey, fieldMeta], index) in Object.entries(meta.fields || {})"
          :key="`${childFieldKey}-${index}`"
          :name="childFieldKey"
          :meta="fieldMeta"
        />
      </div>
    </FieldSet>
  </div>
</template>
