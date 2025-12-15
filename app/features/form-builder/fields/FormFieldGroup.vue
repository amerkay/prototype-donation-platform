<script setup lang="ts">
import { ref, watch, computed, nextTick, inject, provide } from 'vue'
import { FieldSet, FieldLegend, FieldDescription, FieldError } from '@/components/ui/field'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { Button } from '@/components/ui/button'
import type {
  FieldGroupMeta,
  VeeFieldContext,
  FieldMeta
} from '~/features/form-builder/form-builder-types'
import FormField from '../FormField.vue'
import { scrollToElement } from '../composables/useScrollOnVisible'

interface Props {
  field: VeeFieldContext
  errors: string[]
  meta: FieldGroupMeta
  name: string
}

const props = defineProps<Props>()

const isOpen = ref(props.meta.collapsibleDefaultOpen ?? false)
const collapsibleRef = ref<HTMLElement | null>(null)

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
  if (newIsOpen && collapsibleRef.value) {
    setTimeout(() => {
      nextTick(() => {
        const element = collapsibleRef.value
        if (element instanceof HTMLElement) {
          scrollToElement(element, 20)
        }
      })
    }, 150)
  }
})
</script>

<template>
  <div v-show="isGroupVisible">
    <!-- Collapsible version -->
    <Collapsible
      v-if="meta.collapsible"
      ref="collapsibleRef"
      v-model:open="isOpen"
      class="border rounded-lg"
    >
      <div class="flex items-center justify-between px-4 py-3 border-b">
        <div class="flex-1">
          <h3 v-if="meta.legend || meta.label" class="font-medium text-sm">
            {{ meta.legend || meta.label }}
          </h3>
          <p v-if="meta.description" class="text-muted-foreground text-xs mt-0.5">
            {{ meta.description }}
          </p>
          <FieldError v-if="errors.length > 0" :errors="errors" class="mt-1" />
        </div>
        <CollapsibleTrigger as-child>
          <Button variant="ghost" size="sm" class="ml-4">
            {{ isOpen ? 'Close' : 'Edit' }}
          </Button>
        </CollapsibleTrigger>
      </div>
      <CollapsibleContent force-mount>
        <div v-show="isOpen" class="p-4 space-y-6">
          <template v-for="(group, groupIndex) in fieldGroups" :key="`group-${groupIndex}`">
            <div v-show="group.isGrid" class="grid grid-cols-2 gap-3">
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
      </CollapsibleContent>
    </Collapsible>

    <!-- Non-collapsible version -->
    <FieldSet v-else>
      <FieldLegend v-if="meta.legend || meta.label">{{ meta.legend || meta.label }}</FieldLegend>
      <FieldDescription v-if="meta.description">{{ meta.description }}</FieldDescription>
      <FieldError v-if="errors.length > 0" :errors="errors" class="mb-3" />
      <div class="space-y-6">
        <template v-for="(group, groupIndex) in fieldGroups" :key="`group-${groupIndex}`">
          <div v-show="group.isGrid" class="grid grid-cols-2 gap-3">
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
