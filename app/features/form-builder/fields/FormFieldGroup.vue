<script setup lang="ts">
import { ref, watch, computed, inject, provide, type Ref } from 'vue'
import { FieldSet, FieldLegend, FieldDescription, FieldError } from '@/components/ui/field'
import { AccordionItem, AccordionContent, AccordionTrigger } from '@/components/ui/accordion'
import { Separator } from '@/components/ui/separator'
import type {
  FieldGroupMeta,
  VeeFieldContext,
  FieldMeta
} from '~/features/form-builder/form-builder-types'
import FormField from '../FormField.vue'
import { useScrollOnVisible } from '../composables/useScrollOnVisible'

interface Props {
  field: VeeFieldContext
  errors: string[]
  meta: FieldGroupMeta
  name: string
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

// Group consecutive col-span-1 fields for grid layout
const fieldGroups = computed(() => {
  const groups: Array<{ isGrid: boolean; fields: Array<[string, FieldMeta]> }> = []
  let currentGroup: Array<[string, FieldMeta]> = []
  let isCurrentGroupGrid = false

  Object.entries(props.meta.fields).forEach(([key, fieldMeta]) => {
    const isGridField = fieldMeta.class?.includes('col-span-1')

    if (isGridField !== isCurrentGroupGrid && currentGroup.length > 0) {
      groups.push({ isGrid: isCurrentGroupGrid, fields: currentGroup })
      currentGroup = []
    }

    isCurrentGroupGrid = isGridField ?? false
    currentGroup.push([key, fieldMeta])
  })

  if (currentGroup.length > 0) {
    groups.push({ isGrid: isCurrentGroupGrid, fields: currentGroup })
  }

  return groups
})

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
      <AccordionItem :ref="(el: any) => setElementRef(collapsibleKey, el)" :value="name">
        <AccordionTrigger class="hover:no-underline group">
          <div class="flex items-start justify-between w-full">
            <div class="flex-1 text-left">
              <h3
                v-if="meta.legend || meta.label"
                class="font-medium text-sm group-hover:underline"
              >
                {{ meta.legend || meta.label }}
              </h3>
              <p v-if="meta.description" class="text-muted-foreground text-xs mt-0.5">
                {{ meta.description }}
              </p>
              <FieldError v-if="errors.length > 0" :errors="errors" class="mt-1" />
            </div>
            <span class="text-sm text-muted-foreground">{{ isOpen ? '' : 'Edit' }}</span>
          </div>
        </AccordionTrigger>
        <AccordionContent>
          <div :class="[meta.class, 'space-y-6']">
            <template v-for="(group, groupIndex) in fieldGroups" :key="`group-${groupIndex}`">
              <div v-show="group.isGrid" class="contents">
                <FormField
                  v-for="([fieldKey, fieldMeta], index) in group.fields"
                  :key="`${fieldKey}-${index}`"
                  :name="`${name}.${fieldKey}`"
                  :meta="fieldMeta"
                />
              </div>
              <template v-if="!group.isGrid">
                <FormField
                  v-for="([fieldKey, fieldMeta], index) in group.fields"
                  :key="`${fieldKey}-${index}`"
                  :name="`${name}.${fieldKey}`"
                  :meta="fieldMeta"
                />
              </template>
            </template>
          </div>
        </AccordionContent>
      </AccordionItem>
      <Separator class="my-0" />
    </template>

    <!-- Non-collapsible version -->
    <FieldSet v-else>
      <FieldLegend v-if="meta.legend || meta.label">{{ meta.legend || meta.label }}</FieldLegend>
      <FieldDescription v-if="meta.description">{{ meta.description }}</FieldDescription>
      <FieldError v-if="errors.length > 0" :errors="errors" class="mb-3" />
      <div :class="meta.class || 'space-y-6'">
        <template v-for="(group, groupIndex) in fieldGroups" :key="`group-${groupIndex}`">
          <div v-show="group.isGrid" class="contents">
            <FormField
              v-for="([fieldKey, fieldMeta], index) in group.fields"
              :key="`${fieldKey}-${index}`"
              :name="`${name}.${fieldKey}`"
              :meta="fieldMeta"
            />
          </div>
          <template v-if="!group.isGrid">
            <FormField
              v-for="([fieldKey, fieldMeta], index) in group.fields"
              :key="`${fieldKey}-${index}`"
              :name="`${name}.${fieldKey}`"
              :meta="fieldMeta"
            />
          </template>
        </template>
      </div>
    </FieldSet>
  </div>
</template>
