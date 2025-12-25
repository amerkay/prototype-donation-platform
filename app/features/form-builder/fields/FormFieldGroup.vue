<script setup lang="ts">
import { ref, watch, computed, inject, type Ref } from 'vue'
import { cn } from '@/lib/utils'
import { FieldSet, FieldLegend, FieldDescription } from '@/components/ui/field'
import { AccordionItem, AccordionContent, AccordionTrigger } from '@/components/ui/accordion'
import { Badge } from '@/components/ui/badge'
import type { FieldGroupMeta } from '~/features/form-builder/types'
import { resolveText } from '~/features/form-builder/composables/useResolvedFieldMeta'
import { useContainerFieldSetup } from '~/features/form-builder/composables/useContainerFieldSetup'
import FormField from '../FormField.vue'
import { useScrollOnVisible } from '../composables/useScrollOnVisible'

interface Props {
  meta: FieldGroupMeta
  name: string
}

const props = defineProps<Props>()

// Use unified container setup composable
const {
  isVisible: isGroupVisible,
  hasChildErrors,
  formValues
} = useContainerFieldSetup(props.name, props.meta.visibleWhen)

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
          <div :class="cn('grid grid-cols-1 gap-4', meta.class)">
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
    <FieldSet v-else class="gap-4">
      <FieldLegend v-if="meta.legend || resolvedLabel" :class="cn(meta.labelClass)">{{
        meta.legend || resolvedLabel
      }}</FieldLegend>
      <FieldDescription v-if="meta.description" :class="meta.descriptionClass">
        {{ meta.description }}
      </FieldDescription>
      <div :class="cn('grid grid-cols-1 gap-4', meta.class)">
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

<style scoped>
/* Ensure accordion content overflows correctly */
[data-state='open'] {
  overflow: visible;
}
</style>
