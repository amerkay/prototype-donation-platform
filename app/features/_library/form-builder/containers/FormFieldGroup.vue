<script setup lang="ts">
import { ref, watch, computed, provide, inject, type Ref, type ComputedRef } from 'vue'
import { cn } from '@/lib/utils'
import { FieldSet, FieldLegend, FieldDescription } from '@/components/ui/field'
import {
  Accordion,
  AccordionItem,
  AccordionContent,
  AccordionTrigger
} from '@/components/ui/accordion'
import { Badge } from '@/components/ui/badge'
import type { FieldGroupDef } from '~/features/_library/form-builder/types'
import { resolveText } from '~/features/_library/form-builder/composables/useResolvedFieldMeta'
import { useContainerFieldSetup } from '~/features/_library/form-builder/composables/useContainerFieldSetup'
import { useCombinedErrors } from '~/features/_library/form-builder/composables/useCombinedErrors'
import { useFieldWrapper } from '~/features/_library/form-builder/composables/useFieldWrapper'
import { useContainerValidation } from '~/features/_library/form-builder/composables/useContainerValidation'
import FormFieldList from '../internal/FormFieldList.vue'
import { useScrollOnVisible } from '../composables/useScrollOnVisible'
import {
  useAccordionGroup,
  provideAccordionGroup
} from '~/features/_library/form-builder/composables/useAccordionGroup'
import { useHashTarget } from '~/features/_library/form-builder/composables/useHashTarget'

interface Props {
  meta: FieldGroupDef
  name: string
  class?: string
}

const props = defineProps<Props>()

// Build a unique accordion ID scoped by parent path.
// Using the full path (e.g. 'features.coverCosts.settings') prevents name collisions
// when sibling sections each contain a sub-group with the same field name (e.g. 'settings').
const parentFieldPrefix = inject<string>('fieldPrefix', '')
const accordionId = parentFieldPrefix ? `${parentFieldPrefix}.${props.name}` : props.name

// Only set up accordion state if this field-group is collapsible
let accordionValue: Ref<string | undefined>
let isOpen: ComputedRef<boolean>

if (props.meta.collapsible) {
  const defaultOpen = computed(() => {
    const defaultOpenValue = props.meta.collapsibleDefaultOpen
    // Handle ComputedRef
    if (defaultOpenValue && typeof defaultOpenValue === 'object' && 'value' in defaultOpenValue) {
      return unref(defaultOpenValue)
    }
    if (typeof defaultOpenValue === 'function') {
      // Need scopedFormValues for dynamic defaultOpen - defer to after setup
      return defaultOpenValue
    }
    return defaultOpenValue ?? false
  })

  const { registerAccordion, hasAccordionGroup } = useAccordionGroup()

  // Register with parent accordion group if available, otherwise use local state.
  // Use accordionId (full path) as the key to prevent collisions between same-named
  // sub-groups in different sibling sections (e.g. two 'settings' in 'coverCosts' and 'contactConsent').
  accordionValue = hasAccordionGroup()
    ? registerAccordion(
        accordionId,
        typeof defaultOpen.value === 'function' ? false : Boolean(defaultOpen.value)
      )
    : ref<string | undefined>(
        typeof defaultOpen.value === 'function'
          ? undefined
          : defaultOpen.value
            ? accordionId
            : undefined
      )

  isOpen = computed(() => accordionValue.value === accordionId)

  // Bidirectional sync with external collapsibleStateRef if provided
  if (props.meta.collapsibleStateRef) {
    const externalRef = props.meta.collapsibleStateRef
    watch(
      externalRef,
      (val) => {
        accordionValue.value = val
      },
      { flush: 'sync' }
    )
    watch(accordionValue, (val) => {
      externalRef.value = val
    })
  }

  // Provide isolated accordion group context for children to prevent cross-level interference
  provideAccordionGroup()
} else {
  // Non-collapsible: no accordion state needed
  accordionValue = ref(undefined)
  isOpen = computed(() => false)
}

// Use unified container setup composable
const {
  isVisible: isGroupVisible,
  scopedFormValues,
  fullPath
} = useContainerFieldSetup(props.name, props.meta.visibleWhen)

// Auto-expand accordion when hash target is inside this group
const {
  isAncestorOfHashTarget,
  elementRef: groupEl,
  hashHighlightClass
} = useHashTarget(fullPath, { animate: true })
if (props.meta.collapsible) {
  watch(
    isAncestorOfHashTarget,
    (isAncestor) => {
      if (isAncestor) accordionValue.value = accordionId
    },
    { immediate: true }
  )
}

// Extract resolvedDisabled from useFieldWrapper for standard disabled support
const { resolvedDisabled, resolvedClass } = useFieldWrapper(props.meta, props.name, () => [])

// Propagate disabled state to child fields via inject/provide
provide('parentGroupDisabled', () => resolvedDisabled.value)

// Compute combined errors if fields are provided
// Include container-level rules for schema validation when unmounted
const hasChildErrors = props.meta.fields
  ? useCombinedErrors(fullPath, props.meta.fields, scopedFormValues, props.meta.rules)
  : computed(() => false)

// Validate container-level rules if defined
const { containerErrors } = useContainerValidation(
  fullPath,
  props.meta.rules,
  scopedFormValues,
  () => isGroupVisible.value
)

// Resolve dynamic defaultOpen after scopedFormValues is available
if (props.meta.collapsible && typeof props.meta.collapsibleDefaultOpen === 'function') {
  watch(
    scopedFormValues,
    (ctx) => {
      if (accordionValue.value === undefined && props.meta.collapsibleDefaultOpen) {
        const shouldOpen =
          typeof props.meta.collapsibleDefaultOpen === 'function'
            ? props.meta.collapsibleDefaultOpen(ctx)
            : props.meta.collapsibleDefaultOpen
        if (shouldOpen) {
          accordionValue.value = accordionId
        }
      }
    },
    { immediate: true }
  )
}

const resolvedLabel = computed(() => resolveText(props.meta.label, scopedFormValues.value))

// Setup scroll tracking for collapsible
const { setElementRef, scrollToElement } = useScrollOnVisible(
  computed(() => (isOpen.value ? [props.name] : [])),
  {
    isVisible: () => true,
    getKey: (key) => key
  }
)

// Watch accordion state to scroll when opened
if (props.meta.collapsible) {
  watch(isOpen, (newIsOpen) => {
    if (newIsOpen) {
      scrollToElement(props.name)
    }
  })
}
</script>

<template>
  <!-- Collapsible version with self-contained Accordion -->
  <Accordion
    v-if="meta.collapsible"
    v-show="isGroupVisible"
    v-model="accordionValue"
    type="single"
    collapsible
    :class="cn('w-full', hashHighlightClass, meta.wrapperClass, props.class)"
  >
    <AccordionItem
      :ref="
        (el: any) => {
          setElementRef(props.name, el)
          groupEl = el?.$el || el
        }
      "
      :value="accordionId"
      :unmount-on-hide="true"
    >
      <AccordionTrigger
        class="hover:no-underline group -my-4"
        :class="{ 'opacity-75': resolvedDisabled }"
      >
        <div class="flex items-start justify-between w-full">
          <div class="flex-1 text-left">
            <div class="flex items-center gap-2">
              <h3
                v-if="meta.legend || resolvedLabel"
                :class="
                  cn(
                    meta.labelClass,
                    'text-sm',
                    isOpen ? 'font-bold opacity-75' : 'font-medium',
                    !resolvedDisabled && 'group-hover:underline'
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
              <Badge
                v-if="hasChildErrors || containerErrors.length > 0"
                variant="destructive"
                class="text-xs gap-1"
              >
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
          <span class="text-sm text-muted-foreground">{{
            isOpen ? '' : resolvedDisabled ? 'View' : 'Edit'
          }}</span>
        </div>
      </AccordionTrigger>
      <AccordionContent class="pt-4 pb-0">
        <FormFieldList
          :fields="meta.fields || {}"
          :field-context="scopedFormValues"
          :class="cn(resolvedClass)"
        />
        <div v-if="containerErrors.length > 0" class="mt-3 text-sm text-destructive">
          <p v-for="(error, idx) in containerErrors" :key="idx">{{ error }}</p>
        </div>
      </AccordionContent>
    </AccordionItem>
  </Accordion>

  <!-- Non-collapsible version -->
  <FieldSet
    v-else
    v-show="isGroupVisible"
    ref="groupEl"
    :class="cn(hashHighlightClass, meta.wrapperClass, props.class)"
  >
    <FieldLegend
      v-if="meta.legend || resolvedLabel"
      :class="cn('mb-0 text-foreground/75 -ml-1 px-1', meta.labelClass)"
      >{{ meta.legend || resolvedLabel }}</FieldLegend
    >
    <FieldDescription v-if="meta.description" :class="meta.descriptionClass">
      {{ meta.description }}
    </FieldDescription>
    <FormFieldList
      :fields="meta.fields || {}"
      :field-context="scopedFormValues"
      :class="resolvedClass"
    />
    <div v-if="containerErrors.length > 0" class="mt-3 text-sm text-destructive">
      <p v-for="(error, idx) in containerErrors" :key="idx">{{ error }}</p>
    </div>
  </FieldSet>
</template>

<style scoped>
/* Ensure accordion content overflows correctly */
[data-state='open'] {
  overflow: visible;
}
</style>
