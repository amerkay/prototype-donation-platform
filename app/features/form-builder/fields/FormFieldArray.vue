<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useDragAndDrop } from '@formkit/drag-and-drop/vue'
import { vAutoAnimate } from '@formkit/auto-animate'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import type { ArrayFieldMeta, VeeFieldContext } from '~/features/form-builder/form-builder-types'
import FormField from '../FormField.vue'
import { useResolvedFieldMeta } from '~/features/form-builder/composables/useResolvedFieldMeta'
import { useChildFieldErrors } from '~/features/form-builder/composables/useChildFieldErrors'
import { useFormBuilderContext } from '~/features/form-builder/composables/useFormBuilderContext'
import FormFieldWrapper from '~/features/form-builder/components/FormFieldWrapper.vue'
import { resolveVeeFieldPath } from '~/features/form-builder/field-path-utils'

interface Props {
  field: VeeFieldContext
  errors: string[]
  meta: ArrayFieldMeta
  name: string
  touched: boolean
  onChange?: (value: unknown) => void
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

// Provide context that child fields are inside an array
provide('isInsideArray', true)

// Check if this array itself is inside another array (for nested arrays)
const parentIsInsideArray = inject<boolean>('isInsideArray', false)

// Check if any child items have validation errors
// Use resolved vee-validate path to match error keys correctly
const { hasChildErrors } = useChildFieldErrors(resolvedVeeName)

// Show child error indicator if: touched, inside another array, or has child errors
const shouldShowChildErrors = computed(() => {
  return props.touched || parentIsInsideArray || hasChildErrors.value
})

// Combine own errors with child errors indicator
const allErrors = computed(() => {
  // Show child error indicator when appropriate (takes priority for clearer UX)
  if (shouldShowChildErrors.value && hasChildErrors.value) {
    return ['One or more errors above, please fix']
  }

  // Show own array-level validation errors
  if (props.errors.length > 0) return props.errors

  return []
})

const { resolvedLabel, resolvedDescription } = useResolvedFieldMeta(props.meta)

const items = computed(() => {
  const value = props.field.value as unknown[] | undefined
  return Array.isArray(value) ? value : []
})

// Stable keys (short + sufficient). Keeps DOM moves correct while reordering.
const itemKeys = ref<string[]>([])
let uid = 0
const key = () => String(++uid)

function ensureKeysLength(len: number) {
  if (itemKeys.value.length === len) return
  itemKeys.value = Array.from({ length: len }, (_, i) => itemKeys.value[i] ?? key())
}

function moveKey(from: number, to: number) {
  if (from === to) return
  const keys = itemKeys.value.slice()
  const [moved] = keys.splice(from, 1)
  if (!moved) return
  keys.splice(to, 0, moved)
  itemKeys.value = keys
}

function insertPoint() {
  const el = document.createElement('div')
  el.className = 'ff-array__insert'
  el.setAttribute('aria-hidden', 'true')
  return el
}

const [parent, draggableItems] = useDragAndDrop(items.value, {
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
      moveKey(from!, to!)
      props.field.onChange(draggableItems.value)
      props.onChange?.(draggableItems.value)
    }
  },

  onDragend() {
    props.field.onChange(draggableItems.value)
    props.onChange?.(draggableItems.value)
  }
})

watch(
  items,
  (next) => {
    ensureKeysLength(next.length)
    if (JSON.stringify(next) !== JSON.stringify(draggableItems.value)) {
      draggableItems.value = [...next]
    }
  },
  { deep: true, immediate: true }
)

function addItem() {
  const next = [...draggableItems.value]

  let defaultValue: unknown
  if (props.meta.itemField.type === 'field-group') defaultValue = {}
  else if (props.meta.itemField.type === 'number') defaultValue = undefined
  else defaultValue = ''

  next.push(defaultValue)
  draggableItems.value = next
  itemKeys.value = [...itemKeys.value, key()]
  props.field.onChange(next)
  props.onChange?.(next)
}

function removeItem(index: number) {
  const next = draggableItems.value.filter((_, i) => i !== index)
  itemKeys.value = itemKeys.value.filter((_, i) => i !== index)
  props.field.onChange(next)
  props.onChange?.(next)
}
</script>

<template>
  <FormFieldWrapper
    :label="resolvedLabel"
    :description="resolvedDescription"
    :optional="meta.optional"
    :errors="allErrors"
    :invalid="false"
    :class="cn(meta.class, 'space-y-3', allErrors.length && 'ff-array--has-errors')"
    :label-class="meta.labelClass"
    :description-class="meta.descriptionClass"
  >
    <div class="space-y-3">
      <div ref="parent" v-auto-animate="{ duration: 180 }" class="space-y-3">
        <div
          v-for="(item, index) in draggableItems"
          :key="itemKeys[index] || index"
          class="ff-array__item"
        >
          <span class="drag-handle ff-array__handle">
            <Icon name="lucide:grip-vertical" class="h-5 w-5" />
          </span>

          <div class="min-w-0 flex-1">
            <FormField
              :key="`${name}-${index}-${itemKeys[index]}`"
              :name="`${name}.${index}`"
              :meta="meta.itemField"
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

/* Error state for array label */
.ff-array--has-errors :deep(label) {
  @apply text-destructive;
}

/* Keep Tailwind usage centralized + readable */
.ff-array__item {
  @apply relative flex gap-2 rounded-lg border bg-card p-2 transition-colors hover:bg-accent/5;
}

.ff-array__handle {
  @apply shrink-0 p-1 text-muted-foreground hover:text-foreground cursor-grab active:cursor-grabbing touch-none;
}

.ff-array__remove {
  @apply h-8 w-8 shrink-0 text-muted-foreground hover:text-destructive hover:bg-destructive/10;
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
