<script setup lang="ts">
import { computed, watch, nextTick, toRaw } from 'vue'
import { useFieldArray, useValidateField } from 'vee-validate'
import { useDragAndDrop } from '@formkit/drag-and-drop/vue'
import { vAutoAnimate } from '@formkit/auto-animate'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import type { ArrayFieldMeta } from '~/features/form-builder/types'
import FormField from '../FormField.vue'
import { useResolvedFieldMeta } from '~/features/form-builder/composables/useResolvedFieldMeta'
import { useChildFieldErrors } from '~/features/form-builder/composables/useChildFieldErrors'
import { useFormBuilderContext } from '~/features/form-builder/composables/useFormBuilderContext'
import FormFieldWrapper from '~/features/form-builder/components/FormFieldWrapper.vue'
import { resolveVeeFieldPath } from '~/features/form-builder/composables/useFieldPath'

interface Props {
  modelValue?: unknown[]
  errors: string[]
  meta: ArrayFieldMeta
  name: string
  touched: boolean
  onBlur?: (e?: Event) => void
}

const props = defineProps<Props>()

// Inject common form builder context
const { sectionId, fieldPrefix } = useFormBuilderContext()

// Resolve the full vee-validate field path (same pattern as FormField.vue)
// This is needed for useChildFieldErrors to correctly match error keys
const resolvedVeeName = computed(() => {
  return resolveVeeFieldPath({
    name: props.name,
    sectionId,
    fieldPrefix
  })
})

// Check if any child items have validation errors
// Use resolved vee-validate path to match error keys correctly
const { hasChildErrors } = useChildFieldErrors(resolvedVeeName)

// Combine own errors with child errors indicator
const allErrors = computed(() => {
  // If there are child errors, show friendly message
  if (hasChildErrors.value) {
    return ['One or more errors above, please fix']
  }

  // If array has items but array-level validation fails, it's likely because of invalid child values
  // Show friendly message instead of raw Zod error (e.g., "expected number, received undefined")
  if (props.errors.length > 0 && fields.value.length > 0) {
    return ['One or more errors above, please fix']
  }

  // Show array-level validation errors only when array is empty (e.g., "at least one item required")
  if (props.errors.length > 0) return props.errors

  return []
})

// Mark array label as red when there are any errors (array-level OR child errors)
// This matches the allErrors behavior for visual consistency
const arrayLabelClass = computed(() =>
  cn(props.meta.labelClass, allErrors.value.length > 0 && 'text-destructive')
)

const { resolvedLabel, resolvedDescription } = useResolvedFieldMeta(props.meta)

// Use vee-validate's useFieldArray for proper array management with error cleanup
const { fields, push, move, replace } = useFieldArray(resolvedVeeName)

// Get validation function for this array field to handle array-level validation
const validateArrayField = useValidateField(resolvedVeeName)

// Watch for value changes and trigger array validation to clear stale array-level errors
// This ensures array-level schemas (like z.array(z.number())) stay in sync
watch(
  () => fields.value.map((f) => f.value),
  () => {
    validateArrayField()
  },
  { deep: true }
)

// Create array of values for drag-and-drop (synced from vee-validate fields)
const draggableValues = computed(() => fields.value.map((f) => f.value))

function insertPoint() {
  const el = document.createElement('div')
  el.className = 'ff-array__insert'
  el.setAttribute('aria-hidden', 'true')
  return el
}

// Setup drag-and-drop with vee-validate field array values
// Use toRaw() to pass plain values, preventing readonly proxy issues
const [parent, _draggableItems] = useDragAndDrop(toRaw(draggableValues.value), {
  dragHandle: '.drag-handle',
  insertConfig: { insertPoint },

  // Small, maintainable hooks for styling
  draggingClass: 'ff-array__dragging',
  dragPlaceholderClass: 'ff-array__placeholder',
  synthDragPlaceholderClass: 'ff-array__placeholder',
  dropZoneParentClass: 'ff-array__zone',
  synthDropZoneParentClass: 'ff-array__zone',

  onSort(e: { previousPosition?: number; position?: number }) {
    const from = e.previousPosition
    const to = e.position
    if (Number.isInteger(from) && Number.isInteger(to)) {
      move(from!, to!)
      // Recalculate error paths after reorder
      nextTick(() => {
        const currentValues = fields.value.map((f) => toRaw(f.value))
        replace(currentValues)
      })
    }
  },

  onDragend() {
    validateArrayField()
  }
})

/**
 * Recursively create default values for field structures
 */
function createDefaultValue(fieldMeta: typeof props.meta.itemField): unknown {
  if (fieldMeta.type === 'field-group') {
    const groupDefaults: Record<string, unknown> = {}
    if (fieldMeta.fields) {
      for (const [key, nestedField] of Object.entries(fieldMeta.fields)) {
        groupDefaults[key] = createDefaultValue(nestedField)
      }
    }
    return groupDefaults
  } else if (fieldMeta.type === 'array') {
    return []
  } else if (
    fieldMeta.type === 'number' ||
    fieldMeta.type === 'currency' ||
    fieldMeta.type === 'slider'
  ) {
    return undefined
  } else if (fieldMeta.type === 'toggle') {
    return false
  } else {
    return ''
  }
}

function addItem() {
  const defaultValue = createDefaultValue(props.meta.itemField)
  push(defaultValue)
  validateArrayField()
}

function removeItem(index: number) {
  // Use replace() to properly reindex fields and clear orphaned errors
  const newArray = fields.value.map((f) => toRaw(f.value)).filter((_, i) => i !== index)
  replace(newArray)
  validateArrayField()
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
      <div ref="parent" v-auto-animate="{ duration: 180 }" :class="cn('grid gap-2', meta.class)">
        <div v-for="(fieldItem, index) in fields" :key="fieldItem.key" class="ff-array__item">
          <span class="drag-handle ff-array__handle">
            <Icon name="lucide:grip-vertical" class="h-5 w-5" />
          </span>

          <div class="min-w-0 flex-1">
            <FormField
              :name="`${name}[${index}]`"
              :meta="meta.itemField"
              :class="
                cn(
                  'border-0 bg-transparent rounded-none',
                  meta.itemField.type === 'field-group' && meta.itemField.collapsible
                    ? 'mt-0.5'
                    : ''
                )
              "
            />
          </div>

          <Button
            type="button"
            variant="ghost"
            size="icon"
            class="ff-array__remove"
            :aria-label="meta.removeButtonText || 'Remove item'"
            @click="removeItem(index)"
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
@reference '@/assets/css/main.css';

/* Keep Tailwind usage centralized + readable */
.ff-array__item {
  @apply relative flex items-start rounded-lg border bg-card px-0 transition-colors hover:bg-accent/5;
}

.ff-array__handle {
  @apply shrink-0 py-1.5 mt-1 px-2 text-muted-foreground hover:text-foreground cursor-grab active:cursor-grabbing touch-none;
}

.ff-array__remove {
  @apply mt-0.5 h-8 w-8 shrink-0 text-muted-foreground hover:text-destructive hover:bg-destructive/10;
}

/* Drag state polish */
:global(.ff-array__dragging) {
  @apply opacity-90 shadow-lg;
}

/* Placeholder: keep space but hide stale content */
:global(.ff-array__placeholder) {
  @apply bg-muted/40 border-border/60;
}
:global(.ff-array__placeholder *) {
  visibility: hidden;
}

/* Drop zone hint (subtle) */
:global(.ff-array__zone) {
  @apply outline-2 outline-primary/15 outline-offset-4 rounded-xl;
}

/* Insert indicator (drop marker). Created in JS so must be :global */
:global(.ff-array__insert) {
  @apply relative h-3 rounded-md border border-dashed border-primary/35 bg-primary/10 overflow-hidden;
}
:global(.ff-array__insert::after) {
  content: '';
  @apply absolute left-2 right-2 top-1/2 h-0.5 -translate-y-1/2 rounded-full bg-primary/70;
  box-shadow: 0 0 0 6px hsl(var(--primary) / 0.12);
}
</style>
