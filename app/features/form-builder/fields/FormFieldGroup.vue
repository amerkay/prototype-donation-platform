<script setup lang="ts">
import { ref, watch, computed, nextTick } from 'vue'
import { FieldSet, FieldLegend, FieldDescription, FieldGroup } from '@/components/ui/field'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { Button } from '@/components/ui/button'
import type { FieldGroupMeta, VeeFieldContext } from '~/features/form-builder/form-builder-types'
import FormField from '../FormField.vue'
import { scrollToElement } from '../composables/useScrollOnVisible'

interface Props {
  field: VeeFieldContext
  errors: string[]
  meta: FieldGroupMeta
  name: string
}

const props = defineProps<Props>()

// Track open state for collapsible
const isOpen = ref(props.meta.collapsibleDefaultOpen ?? false)

// Determine layout class based on meta.class or use default grid layout
const layoutClass = computed(() => {
  // If custom class is provided, use it; otherwise default to grid layout
  return props.meta.class || 'grid grid-cols-2 gap-3'
})

// Track collapsible container ref for scrolling
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const collapsibleRef = ref<any>(null)

// Watch for when collapsible opens and scroll to show entire expanded content
watch(isOpen, (newIsOpen) => {
  if (newIsOpen && collapsibleRef.value) {
    setTimeout(() => {
      nextTick(() => {
        // Get the actual DOM element from the component ref
        const element = collapsibleRef.value?.$el || collapsibleRef.value
        if (element instanceof HTMLElement) {
          scrollToElement(element, 20)
        }
      })
    }, 150)
  }
})
</script>

<template>
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
      </div>
      <CollapsibleTrigger as-child>
        <Button variant="ghost" size="sm" class="ml-4">
          {{ isOpen ? 'Close' : 'Edit' }}
        </Button>
      </CollapsibleTrigger>
    </div>
    <CollapsibleContent force-mount>
      <div v-show="isOpen" class="p-4">
        <FieldGroup :class="layoutClass">
          <FormField
            v-for="(fieldMeta, fieldKey) in meta.fields"
            :key="fieldKey"
            :name="`${name}.${fieldKey}`"
            :meta="fieldMeta"
          />
        </FieldGroup>
      </div>
    </CollapsibleContent>
  </Collapsible>

  <!-- Non-collapsible version -->
  <FieldSet v-else :class="layoutClass">
    <FieldLegend v-if="meta.legend || meta.label">{{ meta.legend || meta.label }}</FieldLegend>
    <FieldDescription v-if="meta.description">{{ meta.description }}</FieldDescription>
    <FieldGroup :class="layoutClass">
      <FormField
        v-for="(fieldMeta, fieldKey) in meta.fields"
        :key="fieldKey"
        :name="`${name}.${fieldKey}`"
        :meta="fieldMeta"
      />
    </FieldGroup>
  </FieldSet>
</template>
