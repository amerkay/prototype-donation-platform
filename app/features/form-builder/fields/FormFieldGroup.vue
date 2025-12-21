<script setup lang="ts">
import { ref, watch, computed, inject, provide, type Ref } from 'vue'
import { cn } from '@/lib/utils'
import { FieldSet, FieldLegend, FieldDescription } from '@/components/ui/field'
import { AccordionItem, AccordionContent, AccordionTrigger } from '@/components/ui/accordion'
import { Badge } from '@/components/ui/badge'
import type { FieldGroupMeta } from '~/features/form-builder/form-builder-types'
import {
  getRecordAtPath,
  joinPath,
  toSectionRelativePath
} from '~/features/form-builder/field-path-utils'
import FormField from '../FormField.vue'
import { useScrollOnVisible } from '../composables/useScrollOnVisible'
import { useChildFieldErrors } from '../composables/useChildFieldErrors'

interface Props {
  meta: FieldGroupMeta
  name: string
}

const props = defineProps<Props>()

const sectionId = inject<string>('sectionId', '')

// Get accordion state from parent (FormRenderer)
const accordionValue = inject<Ref<string | undefined>>('accordionValue', ref(undefined))
const isOpen = computed(() => accordionValue.value === props.name)

// Get form values for dynamic label resolution (as ComputedRef for reactivity)
const formValues = inject<ComputedRef<Record<string, unknown>>>(
  'formValues',
  computed(() => ({}))
)

const resolvedLabel = computed(() =>
  typeof props.meta.label === 'function' ? props.meta.label(formValues.value) : props.meta.label
)

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

// Visibility management
const parentGroupVisible = inject<() => boolean>('parentGroupVisible', () => true)

const isGroupVisible = computed(() => {
  if (!parentGroupVisible()) return false
  if (!props.meta.visibleWhen) return true
  return props.meta.visibleWhen(formValues.value)
})

provide('parentGroupVisible', () => isGroupVisible.value)

// Normalize to section-relative path
const groupPath = computed(() => {
  return toSectionRelativePath(props.name, sectionId)
})

// Construct full path for child error detection
const fullGroupPath = computed(() => {
  return sectionId ? `${sectionId}.${groupPath.value}` : groupPath.value
})

// Check if any child fields have validation errors
// Uses vee-validate's useFormErrors() internally for guaranteed reactivity
const { hasChildErrors } = useChildFieldErrors(fullGroupPath)

// Field prefix context for nested paths
// This allows child fields to compute relative paths
const parentFieldPrefix = inject<string>('fieldPrefix', '')
const currentFieldPrefix = computed(() => {
  return joinPath(parentFieldPrefix, groupPath.value)
})

// Provide the cumulative prefix to child fields
provide('fieldPrefix', currentFieldPrefix.value)

// Provide scoped form values to child fields (as ComputedRef for reactivity)
const scopedFormValues = computed(() => {
  const fullValues = formValues.value
  const groupValue = getRecordAtPath(fullValues, groupPath.value)
  return { ...fullValues, ...(groupValue || {}) }
})
provide('formValues', scopedFormValues)

// Scroll to collapsible when opened
watch(isOpen, (newIsOpen) => {
  if (newIsOpen) {
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
      >
        <AccordionTrigger
          class="hover:no-underline group py-4"
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
        <AccordionContent>
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
      <FieldLegend v-if="meta.legend || resolvedLabel" :class="cn('mb-2', meta.labelClass)">{{
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
