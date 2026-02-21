<script setup lang="ts">
import { computed, watch, nextTick, ref, provide } from 'vue'
import { useFieldArray, useFormValues, useValidateField } from 'vee-validate'
import { vAutoAnimate } from '@formkit/auto-animate'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import type {
  ArrayFieldDef,
  FieldDef,
  OnChangeContext
} from '~/features/_library/form-builder/types'
import FormField from '../FormField.vue'
import { useResolvedFieldMeta } from '~/features/_library/form-builder/composables/useResolvedFieldMeta'
import { useChildFieldErrors } from '~/features/_library/form-builder/composables/useChildFieldErrors'
import { useFormBuilderContext } from '~/features/_library/form-builder/composables/useFormBuilderContext'
import FormFieldWrapper from '~/features/_library/form-builder/internal/FormFieldWrapper.vue'
import { resolveVeeFieldPath } from '~/features/_library/form-builder/composables/useFieldPath'
import { extractDefaultValues } from '~/features/_library/form-builder/utils/defaults'
import { useAccordionGroup } from '~/features/_library/form-builder/composables/useAccordionGroup'

function getValueAtVeePath(root: unknown, veePath: string): unknown {
  // Convert bracket notation (foo[0].bar) into dot notation (foo.0.bar)
  const normalizedPath = veePath.replace(/\[(\d+)\]/g, '.$1')
  const parts = normalizedPath.split('.').filter(Boolean)

  return parts.reduce<unknown>((acc, part) => {
    if (acc == null) return undefined
    if (typeof acc !== 'object') return undefined
    return (acc as Record<string, unknown>)[part]
  }, root)
}

interface Props {
  modelValue?: unknown[]
  errors: string[]
  meta: ArrayFieldDef
  name: string
  touched: boolean
  onBlur?: (e?: Event) => void
}

const props = defineProps<Props>()

// Full vee-validate form values (includes sectionId prefix)
const veeFormValues = useFormValues<Record<string, unknown>>()

// Inject common form builder context (includes validation setters)
const { sectionId, fieldPrefix, formValues, setFieldValue, setFieldError, setFieldTouched } =
  useFormBuilderContext()

// Provide scoped context for child fields (array items)
// This allows item field rules to access parent values (e.g., customAmount for validation)
const scopedFormValues = computed(() => ({
  values: formValues.value,
  parent: formValues.value,
  root: formValues.value
}))
provide('scopedFormValues', scopedFormValues)

// Provide accordion group for child collapsible field-groups
const { provideAccordionGroup } = useAccordionGroup()
provideAccordionGroup()

// Trigger onChange callback if defined in meta
function triggerOnChange() {
  if (typeof props.meta.onChange === 'function') {
    const currentValues = fields.value.map((f) => f.value)
    props.meta.onChange({
      values: formValues.value,
      value: currentValues,
      parent: {}, // parent context not easily available here
      root: formValues.value,
      form: formValues.value,
      setValue: setFieldValue,
      setFieldError,
      setFieldTouched,
      path: resolvedVeeName.value
    } as OnChangeContext)
  }
}

// Resolve the full vee-validate field path
const resolvedVeeName = computed(() => {
  return resolveVeeFieldPath({
    name: props.name,
    sectionId,
    fieldPrefix
  })
})

// Array items are rendered as individual fields, so we track child errors at the array level
// This catches both mounted field errors and schema validation errors
const { hasChildErrors: liveChildErrors } = useChildFieldErrors(resolvedVeeName)
const hasChildErrors = computed(() => liveChildErrors.value)

const allErrors = computed(() => {
  if (hasChildErrors.value) return ['One or more errors above, please fix']
  if (props.errors.length > 0 && fields.value.length > 0)
    return ['One or more errors above, please fix']
  if (props.errors.length > 0) return props.errors
  return []
})

const arrayLabelClass = computed(() =>
  cn(props.meta.labelClass, allErrors.value.length > 0 && 'text-destructive')
)

const { resolvedLabel, resolvedDescription, resolvedClass } = useResolvedFieldMeta(props.meta)

// --- vee-validate array state ---
const { fields, push, move, remove, replace } = useFieldArray(resolvedVeeName)
const validateArrayField = useValidateField(resolvedVeeName)

// Keep array-level schema in sync with edits (NOT reorders)
watch(
  () => fields.value.map((f) => f.value),
  () => {
    validateArrayField()
  },
  // IMPORTANT: don't deep-watch object items here.
  // Deep watching causes parent arrays-of-objects to revalidate for every nested change,
  // which can thrash dynamic itemField builders (e.g. condition builder) and appear as a loop.
  { flush: 'post' }
)

const isSortable = computed(() => props.meta.sortable === true)

// --- Native HTML5 Drag & Drop ---
const arrayContainer = ref<HTMLElement>()
const draggedIndex = ref<number | null>(null)
const dragOverIndex = ref<number | null>(null)
const isDragging = ref(false)

// Base keys from vee-validate fields
const baseKeys = computed(() => fields.value.map((f) => String(f.key)))

// Visual order during drag - reorders items in real-time for smooth UX
const visualOrder = ref<string[]>([])

// Initialize visual order
watch(
  baseKeys,
  (keys) => {
    if (!isDragging.value) {
      visualOrder.value = keys.slice()
    }
  },
  { immediate: true }
)

// Map key -> vee index for stable value binding
const keyToVeeIndex = computed(() => {
  const map = new Map<string, number>()
  fields.value.forEach((f, i) => {
    map.set(String(f.key), i)
  })
  return map
})

// Render model: uses visual order during drag, base order otherwise
const orderedItems = computed(() => {
  const keys = isDragging.value ? visualOrder.value : baseKeys.value
  return keys
    .map((k) => {
      const idx = keyToVeeIndex.value.get(k)
      if (idx === undefined) return null
      return { key: k, veeIndex: idx }
    })
    .filter(Boolean) as Array<{ key: string; veeIndex: number }>
})

// Drag event handlers
function onDragStart(event: DragEvent, veeIndex: number) {
  try {
    if (!isSortable.value) return

    const draggedKey = baseKeys.value[veeIndex]
    if (!draggedKey) return

    draggedIndex.value = veeIndex
    isDragging.value = true

    if (event.dataTransfer) {
      event.dataTransfer.effectAllowed = 'move'
      event.dataTransfer.setData('text/plain', draggedKey)
      // Make drag image semi-transparent (optional, not supported in test environments)
      if (typeof event.dataTransfer.setDragImage === 'function') {
        const target = (event.target as HTMLElement).closest('.ff-array__item')
        if (target) {
          event.dataTransfer.setDragImage(target as HTMLElement, 20, 20)
        }
      }
    }
  } catch (e) {
    console.error('Error in onDragStart:', e)
  }
}

function onDragEnd() {
  try {
    // Commit the visual order to vee-validate
    if (draggedIndex.value !== null) {
      const currentOrder = baseKeys.value
      const desiredOrder = visualOrder.value

      // Calculate the moves needed
      const draggedKey = currentOrder[draggedIndex.value]
      const newIndex = desiredOrder.indexOf(draggedKey!)

      if (newIndex !== -1 && newIndex !== draggedIndex.value) {
        move(draggedIndex.value, newIndex)
        nextTick(() => {
          validateArrayField()
          triggerOnChange()
        })
      }
    }
  } catch (e) {
    console.error('Error in onDragEnd:', e)
  } finally {
    isDragging.value = false
    draggedIndex.value = null
    dragOverIndex.value = null
  }
}

function onDragOver(event: DragEvent, targetVeeIndex: number) {
  try {
    if (!isSortable.value || draggedIndex.value === null) return
    event.preventDefault()

    if (event.dataTransfer) {
      event.dataTransfer.dropEffect = 'move'
    }

    // Update visual order for instant feedback
    if (draggedIndex.value !== targetVeeIndex) {
      const draggedKey = baseKeys.value[draggedIndex.value]
      if (!draggedKey) return

      const newOrder = baseKeys.value.filter((k) => k !== draggedKey)
      const targetKey = baseKeys.value[targetVeeIndex]
      let insertIndex = newOrder.indexOf(targetKey!)

      if (insertIndex !== -1) {
        // Insert after target when dragging downward, before when dragging upward
        if (draggedIndex.value < targetVeeIndex) {
          insertIndex++
        }
        newOrder.splice(insertIndex, 0, draggedKey)
        visualOrder.value = newOrder
      }
    }

    dragOverIndex.value = targetVeeIndex
  } catch (e) {
    console.error('Error in onDragOver:', e)
  }
}

function onDragLeave() {
  dragOverIndex.value = null
}

function onDrop(event: DragEvent) {
  event.preventDefault()
  event.stopPropagation()
}

// --- Touch event handlers (mobile drag & drop) ---
function findItemVeeIndex(el: Element | null): number | null {
  const item = el?.closest('[data-vee-index]') as HTMLElement | null
  if (!item) return null
  const idx = Number(item.dataset.veeIndex)
  return Number.isFinite(idx) ? idx : null
}

function onTouchStart(event: TouchEvent, veeIndex: number) {
  if (!isSortable.value) return
  event.preventDefault()

  draggedIndex.value = veeIndex
  isDragging.value = true
}

function onTouchMove(event: TouchEvent) {
  if (draggedIndex.value === null) return
  event.preventDefault()

  const touch = event.touches[0]
  if (!touch) return

  const targetEl = document.elementFromPoint(touch.clientX, touch.clientY)
  const targetIdx = findItemVeeIndex(targetEl)
  if (targetIdx === null || targetIdx === draggedIndex.value) return

  // Reuse same visual reorder logic as onDragOver
  const draggedKey = baseKeys.value[draggedIndex.value]
  if (!draggedKey) return

  const newOrder = baseKeys.value.filter((k) => k !== draggedKey)
  const targetKey = baseKeys.value[targetIdx]
  let insertIndex = newOrder.indexOf(targetKey!)
  if (insertIndex !== -1) {
    if (draggedIndex.value < targetIdx) insertIndex++
    newOrder.splice(insertIndex, 0, draggedKey)
    visualOrder.value = newOrder
  }
  dragOverIndex.value = targetIdx
}

function onTouchEnd() {
  onDragEnd()
}

// Memoized item field metadata - prevents infinite re-render loop
// Maps each item's index to its resolved field metadata
const itemFieldMetaMap = computed(() => {
  const map = new Map<number, FieldDef>()

  fields.value.forEach((field, index) => {
    const itemField = props.meta.itemField
    if (typeof itemField === 'function') {
      // Call function with the specific item's values plus array context
      map.set(
        index,
        itemField(field.value as Record<string, unknown>, {
          index,
          items: fields.value.map((f) => f.value) as Record<string, unknown>[],
          root: formValues.value
        })
      )
    } else {
      // Static itemField definition
      map.set(index, itemField)
    }
  })

  return map
})

// Check if an item field is a field-group with visible heading (label, legend, or collapsible)
function isLabeledFieldGroup(meta: FieldDef): boolean {
  if (meta.type !== 'field-group') return false
  const m = meta as { label?: string; legend?: string; collapsible?: boolean }
  return !!(m.label || m.legend || m.collapsible)
}

// Helper function to get resolved itemField metadata for a specific item index
function getItemFieldMeta(index: number) {
  return itemFieldMetaMap.value.get(index)!
}

async function addItem() {
  // Guard: the form value can temporarily be a scalar when the schema switches
  // from scalar -> array (e.g. changing an operator to in/notIn).
  // vee-validate's useFieldArray assumes the current value is an array.
  // IMPORTANT: `push()` also stages initial values under the hood. If the *initial*
  // value at this path was a scalar (e.g. 100) and later became an array, vee-validate
  // can still crash during `push()` unless we sync the field-array state via `replace()`.
  const sectionRelativePath = sectionId
    ? resolvedVeeName.value.startsWith(`${sectionId}.`)
      ? resolvedVeeName.value.slice(sectionId.length + 1)
      : resolvedVeeName.value
    : resolvedVeeName.value

  // Read from vee-validate root values (works even when formValues is scoped).
  let currentValue = getValueAtVeePath(veeFormValues.value, resolvedVeeName.value)

  // If the value is not an array, force it to [] via the injected setter first.
  if (!Array.isArray(currentValue)) {
    setFieldValue(sectionRelativePath, [])
    await nextTick()
    currentValue = getValueAtVeePath(veeFormValues.value, resolvedVeeName.value)
  }

  // Sync useFieldArray internal state (and staged initial values) to the latest
  // current array before pushing.
  if (Array.isArray(currentValue)) {
    replace(currentValue)
    await nextTick()
  }

  let defaultValue: unknown = ''

  // Resolve itemField to get default value
  const itemFieldMeta =
    typeof props.meta.itemField === 'function'
      ? props.meta.itemField(
          {}, // Call with empty object for new items
          {
            index: fields.value.length,
            items: fields.value.map((f) => f.value) as Record<string, unknown>[],
            root: formValues.value
          }
        )
      : props.meta.itemField

  // Check if explicit defaultValue is provided at the top level
  if ('defaultValue' in itemFieldMeta && itemFieldMeta.defaultValue !== undefined) {
    defaultValue = itemFieldMeta.defaultValue
  } else if (itemFieldMeta.type === 'field-group') {
    // For field-groups, recursively extract defaults from all nested fields
    // This handles factory fields like min, max, step, etc.
    if ('fields' in itemFieldMeta && itemFieldMeta.fields) {
      defaultValue = extractDefaultValues(itemFieldMeta.fields)
    } else {
      defaultValue = {}
    }
  } else if (itemFieldMeta.type === 'tabs') {
    // For tabs, extract defaults from all tab fields
    if ('tabs' in itemFieldMeta) {
      const tabsDefaults: Record<string, unknown> = {}
      for (const tab of itemFieldMeta.tabs) {
        tabsDefaults[tab.value] = extractDefaultValues(tab.fields)
      }
      defaultValue = tabsDefaults
    } else {
      defaultValue = {}
    }
  }

  push(defaultValue)
  validateArrayField()
  nextTick(() => {
    triggerOnChange()
  })
}

function removeItem(index: number) {
  remove(index)
  validateArrayField()
  nextTick(() => {
    triggerOnChange()
  })
}
</script>

<template>
  <FormFieldWrapper
    :label="resolvedLabel"
    :description="resolvedDescription"
    :optional="meta.optional"
    :errors="allErrors"
    :invalid="false"
    :class="cn('space-y-1')"
    :label-class="arrayLabelClass"
    :description-class="meta.descriptionClass"
  >
    <div class="space-y-2">
      <div
        ref="arrayContainer"
        v-auto-animate="{ duration: 180 }"
        :class="cn('grid gap-2', resolvedClass)"
      >
        <div
          v-for="item in orderedItems"
          :key="`${item.key}-${item.veeIndex}`"
          :data-vee-index="item.veeIndex"
          :class="
            cn(
              'relative flex items-start rounded-lg border bg-card transition-colors',
              isSortable ? 'ff-array__item px-0 pr-9' : 'ff-array__item--simple pr-10',
              !isSortable && getItemFieldMeta(item.veeIndex).type === 'field-group' && 'pl-3',
              draggedIndex === item.veeIndex && 'ff-array__item--dragged opacity-40 scale-95'
            )
          "
          @dragover="onDragOver($event, item.veeIndex)"
          @dragleave="onDragLeave"
          @drop="onDrop"
        >
          <span
            v-if="isSortable"
            :class="
              cn(
                'drag-handle shrink-0 py-1.5 px-2 text-muted-foreground hover:text-foreground cursor-grab active:cursor-grabbing touch-none',
                isLabeledFieldGroup(getItemFieldMeta(item.veeIndex)) ? 'mt-3' : 'mt-1'
              )
            "
            draggable="true"
            @dragstart="onDragStart($event, item.veeIndex)"
            @dragend="onDragEnd"
            @touchstart="onTouchStart($event, item.veeIndex)"
            @touchmove="onTouchMove"
            @touchend="onTouchEnd"
          >
            <Icon name="lucide:grip-vertical" class="size-4!" />
          </span>

          <div class="min-w-0 flex-1" data-has-remove>
            <!-- Bind to veeIndex for stable value binding.
                 key includes veeIndex to force re-creation on reorder for fresh scoped values. -->
            <FormField
              :key="`${item.key}-${item.veeIndex}`"
              :name="`${name}[${item.veeIndex}]`"
              :meta="getItemFieldMeta(item.veeIndex)"
              :class="
                cn(
                  'border-0 bg-transparent rounded-none',
                  isLabeledFieldGroup(getItemFieldMeta(item.veeIndex)) && 'my-4'
                )
              "
            />
          </div>

          <Button
            type="button"
            variant="ghost"
            size="icon"
            :class="
              cn(
                'absolute right-0.5 h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10',
                isLabeledFieldGroup(getItemFieldMeta(item.veeIndex)) ? 'top-2.5' : 'top-0.5'
              )
            "
            :aria-label="meta.removeButtonText || 'Remove item'"
            @click="removeItem(item.veeIndex)"
          >
            <Icon name="lucide:x" class="h-4 w-4" />
          </Button>
        </div>
      </div>

      <Button type="button" variant="outline" size="sm" class="w-full gap-2" @click="addItem">
        <Icon name="lucide:plus" class="h-4 w-4" />
        {{ meta.addButtonText || 'Add Item' }}
      </Button>
    </div>
  </FormFieldWrapper>
</template>

<style scoped>
/* Collapsible field-group content bleeds edge-to-edge within array items.
   CSS custom properties reset at each nesting level to prevent leaking
   into nested arrays (e.g. condition builder inside a sortable array). */
.ff-array__item {
  --ff-accordion-ml: -1.1rem;
  --ff-accordion-mr: -1.4rem;
}

.ff-array__item--simple {
  --ff-accordion-ml: 0;
  --ff-accordion-mr: -1.75rem;
}

.ff-array__item :deep([data-slot='accordion-content'] > div),
.ff-array__item--simple :deep([data-slot='accordion-content'] > div) {
  margin-left: var(--ff-accordion-ml, 0);
  margin-right: var(--ff-accordion-mr, 0);
}

/* Non-collapsible field-group content bleeds edge-to-edge only when the
   fieldset is a direct array-item field (marked by data-has-remove wrapper) */
.ff-array__item :deep([data-has-remove] > [data-slot='field-set']:has(> legend) > .grid),
.ff-array__item :deep([data-has-remove] > * > [data-slot='field-set']:has(> legend) > .grid),
.ff-array__item--simple :deep([data-has-remove] > [data-slot='field-set']:has(> legend) > .grid),
.ff-array__item--simple
  :deep([data-has-remove] > * > [data-slot='field-set']:has(> legend) > .grid) {
  margin-right: var(--ff-accordion-mr, 0);
}
</style>
