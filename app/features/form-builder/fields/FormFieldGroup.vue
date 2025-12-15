<script setup lang="ts">
import { ref, watch, nextTick, computed } from 'vue'
import { FieldSet, FieldLegend, FieldDescription, FieldGroup } from '@/components/ui/field'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { Button } from '@/components/ui/button'
import type { FieldGroupMeta, VeeFieldContext } from '~/features/form-builder/form-builder-types'
import FormField from '../FormField.vue'

interface Props {
  field: VeeFieldContext
  errors: string[]
  meta: FieldGroupMeta
  name: string
}

const props = defineProps<Props>()

// Track open state for collapsible
const isOpen = ref(props.meta.collapsibleDefaultOpen ?? false)

// Track element ref for auto-scroll
const elementRef = ref<HTMLElement | null>(null)

// Determine layout class based on meta.class or use default grid layout
const layoutClass = computed(() => {
  // If custom class is provided, use it; otherwise default to grid layout
  return props.meta.class || 'grid grid-cols-2 gap-3'
})

// Watch for when collapsible opens and scroll into view
watch(isOpen, async (newIsOpen) => {
  if (newIsOpen && elementRef.value) {
    // Wait for content to render
    await nextTick()
    setTimeout(() => {
      if (elementRef.value) {
        scrollToElement(elementRef.value)
      }
    }, 150)
  }
})

/**
 * Scrolls to an element within its scroll container
 */
function scrollToElement(element: HTMLElement, offset: number = 75) {
  const rect = element.getBoundingClientRect()
  const scrollContainer = element.closest(
    '[data-radix-scroll-area-viewport], .overflow-y-auto, .overflow-auto'
  )

  if (scrollContainer) {
    const containerRect = scrollContainer.getBoundingClientRect()
    const scrollTop = scrollContainer.scrollTop + rect.bottom - containerRect.top + offset
    scrollContainer.scrollTo({ top: scrollTop, behavior: 'smooth' })
  }
}
</script>

<template>
  <!-- Collapsible version -->
  <Collapsible v-if="meta.collapsible" v-model:open="isOpen" class="border rounded-lg">
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
    <CollapsibleContent ref="elementRef" force-mount>
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
