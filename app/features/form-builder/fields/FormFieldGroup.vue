<script setup lang="ts">
import { ref, watch, computed, inject, provide, type Ref } from 'vue'
import { FieldSet, FieldLegend, FieldDescription, FieldError } from '@/components/ui/field'
import { AccordionItem, AccordionContent, AccordionTrigger } from '@/components/ui/accordion'
import { Badge } from '@/components/ui/badge'
import type { FieldGroupMeta, VeeFieldContext } from '~/features/form-builder/form-builder-types'
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

// Get accordion state from parent (FormRenderer)
const accordionValue = inject<Ref<string | undefined>>('accordionValue', ref(undefined))
const isOpen = computed(() => accordionValue.value === props.name)

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
const getFormValues = inject<() => Record<string, unknown>>('formValues', () => ({}))
const parentGroupVisible = inject<() => boolean>('parentGroupVisible', () => true)

const isGroupVisible = computed(() => {
  if (!parentGroupVisible()) return false
  if (!props.meta.visibleWhen) return true
  return props.meta.visibleWhen(getFormValues())
})

provide('parentGroupVisible', () => isGroupVisible.value)

// Extract field key from full name path (e.g., "giftAid.homeAddress" -> "homeAddress")
const fieldKey = computed(() => {
  const parts = props.name.split('.')
  return parts[parts.length - 1] || ''
})

// Field prefix context for nested paths
// This allows child fields to compute relative paths
const parentFieldPrefix = inject<string>('fieldPrefix', '')
const currentFieldPrefix = computed(() => {
  // Build cumulative prefix: parent prefix + this field key
  return parentFieldPrefix ? `${parentFieldPrefix}.${fieldKey.value}` : fieldKey.value
})

// Provide the cumulative prefix to child fields
provide('fieldPrefix', currentFieldPrefix.value)

// Provide scoped form values to child fields
// Children see values relative to this group (e.g., homeAddress.country becomes just 'country')
const getScopedFormValues = computed(() => {
  const fullValues = getFormValues()
  const key = fieldKey.value

  if (!key) return {}

  // Get this group's values
  const groupValue = fullValues[key] as Record<string, unknown> | undefined

  // Return the group's values (or empty object if not found)
  return groupValue || {}
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
                  v-if="meta.legend || meta.label"
                  :class="[
                    meta.labelClass,
                    'font-medium text-sm',
                    { 'group-hover:underline': !meta.isDisabled }
                  ]"
                >
                  {{ meta.legend || meta.label }}
                </h3>
                <Badge
                  v-if="meta.badgeLabel"
                  :variant="meta.badgeVariant || 'secondary'"
                  class="text-xs"
                >
                  {{ meta.badgeLabel }}
                </Badge>
              </div>
              <p v-if="meta.description" class="text-muted-foreground text-xs mt-0.5">
                {{ meta.description }}
              </p>
              <FieldError v-if="errors.length > 0" :errors="errors" class="mt-1" />
            </div>
            <span v-if="!meta.isDisabled" class="text-sm text-muted-foreground">{{
              isOpen ? '' : 'Edit'
            }}</span>
          </div>
        </AccordionTrigger>
        <AccordionContent>
          <div :class="['grid grid-cols-1 gap-3', meta.class]">
            <FormField
              v-for="([childFieldKey, fieldMeta], index) in Object.entries(meta.fields || {})"
              :key="`${childFieldKey}-${index}`"
              :name="`${name}.${childFieldKey}`"
              :meta="fieldMeta"
            />
          </div>
        </AccordionContent>
      </AccordionItem>
    </template>

    <!-- Non-collapsible version -->
    <FieldSet v-else class="gap-3">
      <FieldLegend v-if="meta.legend || meta.label" :class="['mb-2', meta.labelClass]">{{
        meta.legend || meta.label
      }}</FieldLegend>
      <FieldDescription v-if="meta.description">{{ meta.description }}</FieldDescription>
      <FieldError v-if="errors.length > 0" :errors="errors" class="mb-3" />
      <div :class="['grid grid-cols-1 gap-3', meta.class]">
        <FormField
          v-for="([childFieldKey, fieldMeta], index) in Object.entries(meta.fields || {})"
          :key="`${childFieldKey}-${index}`"
          :name="`${name}.${childFieldKey}`"
          :meta="fieldMeta"
        />
      </div>
    </FieldSet>
  </div>
</template>
