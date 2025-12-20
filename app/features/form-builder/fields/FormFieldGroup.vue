<script setup lang="ts">
import { ref, watch, computed, inject, provide, type Ref } from 'vue'
import { cn } from '@/lib/utils'
import { FieldError } from '@/components/ui/field'
import { AccordionItem, AccordionContent, AccordionTrigger } from '@/components/ui/accordion'
import { Badge } from '@/components/ui/badge'
import type { FieldGroupMeta, VeeFieldContext } from '~/features/form-builder/form-builder-types'
import {
  getRecordAtPath,
  joinPath,
  toSectionRelativePath
} from '~/features/form-builder/field-path-utils'
import { useResolvedFieldMeta } from '~/features/form-builder/composables/useResolvedFieldMeta'
import FormFieldSetWrapper from '~/features/form-builder/components/FormFieldSetWrapper.vue'
import FormField from '../FormField.vue'
import { useScrollOnVisible } from '../composables/useScrollOnVisible'

interface Props {
  field: VeeFieldContext
  errors: string[]
  meta: FieldGroupMeta
  name: string
  onFieldChange?: (value: unknown, fieldOnChange: (value: unknown) => void) => void
}

const props = defineProps<Props>()

const sectionId = inject<string>('sectionId', '')

// Get accordion state from parent (FormRenderer)
const accordionValue = inject<Ref<string | undefined>>('accordionValue', ref(undefined))
const isOpen = computed(() => accordionValue.value === props.name)

// Get form values for dynamic label resolution
const getFormValues = inject<() => Record<string, unknown>>('formValues', () => ({}))

// Resolved label/description support dynamic functions on meta
const { resolvedLabel, resolvedDescription } = useResolvedFieldMeta(props.meta, getFormValues)

// Set default open on mount if specified
if (props.meta.collapsibleDefaultOpen && !accordionValue.value) {
  accordionValue.value = props.name
}

// Setup scroll tracking for collapsible
const collapsibleKey = computed(() => props.name)
const { setElementRef, scrollToElement } = useScrollOnVisible(
  computed(() => (isOpen.value ? [collapsibleKey.value] : [])),
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
  return props.meta.visibleWhen(getFormValues())
})

provide('parentGroupVisible', () => isGroupVisible.value)

// Normalize to section-relative path.
// - Top-level fields are named like `${sectionId}.fieldKey`.
// - Nested fields (inside field-group/tabs) can be relative like `once.customAmount`.
const groupPath = computed(() => {
  return toSectionRelativePath(props.name, sectionId)
})

// Field prefix context for nested paths
// This allows child fields to compute relative paths
const parentFieldPrefix = inject<string>('fieldPrefix', '')
const currentFieldPrefix = computed(() => {
  return joinPath(parentFieldPrefix, groupPath.value)
})

// Provide the cumulative prefix to child fields
provide('fieldPrefix', currentFieldPrefix.value)

// Provide scoped form values to child fields
// Children see values relative to this group (e.g., homeAddress.country becomes just 'country')
// BUT also preserve parent values so they can reference sibling fields
const getScopedFormValues = computed(() => {
  const fullValues = getFormValues()
  const groupValue = getRecordAtPath(fullValues, groupPath.value)

  // Merge: child fields get their scoped values plus access to parent values
  // Scoped values take precedence (spread groupValue last)
  return { ...fullValues, ...(groupValue || {}) }
})

// Override formValues for child fields to provide scoped values
provide('formValues', () => getScopedFormValues.value)

// Watch for field value changes and call onChange if provided
watch(
  () => props.field.value,
  (newValue) => {
    if (props.meta.onChange && props.onFieldChange) {
      props.onFieldChange(newValue, props.field.onChange)
    }
  }
)

// Scroll to collapsible when opened
watch(isOpen, (newIsOpen) => {
  if (newIsOpen) {
    scrollToElement(collapsibleKey.value)
  }
})
</script>

<template>
  <div v-show="isGroupVisible">
    <!-- Accordion Item version -->
    <template v-if="meta.collapsible">
      <AccordionItem
        :ref="(el: any) => setElementRef(collapsibleKey, el)"
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
              </div>
              <p
                v-if="resolvedDescription"
                :class="cn('text-muted-foreground text-xs mt-0.5', meta.descriptionClass)"
              >
                {{ resolvedDescription }}
              </p>
              <FieldError v-if="errors.length > 0" :errors="errors" class="mt-1" />
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
    <FormFieldSetWrapper
      v-else
      :legend="meta.legend || resolvedLabel"
      :description="resolvedDescription"
      :errors="errors"
      :invalid="!!errors.length"
      class="gap-3"
      :legend-class="cn('mb-2', meta.labelClass)"
      :description-class="meta.descriptionClass"
    >
      <div :class="cn('grid grid-cols-1 gap-3', meta.class)">
        <FormField
          v-for="([childFieldKey, fieldMeta], index) in Object.entries(meta.fields || {})"
          :key="`${childFieldKey}-${index}`"
          :name="childFieldKey"
          :meta="fieldMeta"
        />
      </div>
    </FormFieldSetWrapper>
  </div>
</template>
