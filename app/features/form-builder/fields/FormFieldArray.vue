<script setup lang="ts">
import { computed, watch, nextTick, ref, type Ref } from 'vue'
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
import { extractDefaultValues } from '~/features/form-builder/utils'

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

// Resolve the full vee-validate field path
const resolvedVeeName = computed(() => {
  return resolveVeeFieldPath({
    name: props.name,
    sectionId,
    fieldPrefix
  })
})

// Child error detection uses resolved vee path
const { hasChildErrors } = useChildFieldErrors(resolvedVeeName)

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

const { resolvedLabel, resolvedDescription } = useResolvedFieldMeta(props.meta)

// --- vee-validate array state ---
const { fields, push, move, remove } = useFieldArray(resolvedVeeName)
const validateArrayField = useValidateField(resolvedVeeName)

// Keep array-level schema in sync with edits (NOT reorders)
watch(
  () => fields.value.map((f) => f.value),
  () => {
    validateArrayField()
  },
  { deep: true }
)

const isSortable = computed(() => props.meta.sortable === true)

// --- Drag & Drop (data-first) ---
//
// Best practice in Vue: the values you v-for should be the values returned by useDragAndDrop.
// To integrate with vee-validate (index-based field paths), we drag a list of stable keys,
// and only commit the new order to vee-validate on drop.
type DndKey = string

const isDragging = ref(false)

// Helper: build stable key list from vee field items
const veeKeys = computed<DndKey[]>(() => fields.value.map((f) => String(f.key)))

// DnD setup (only if sortable)
let arrayContainer: Ref<HTMLElement | undefined>
let dndKeys: Ref<DndKey[]>

function insertPoint() {
  const el = document.createElement('div')
  el.className = 'ff-array__insert'
  el.setAttribute('aria-hidden', 'true')
  return el
}

if (isSortable.value) {
  ;[arrayContainer, dndKeys] = useDragAndDrop<DndKey>(veeKeys.value, {
    dragHandle: '.drag-handle',
    draggable: (el) => !el.classList.contains('ff-array__insert'),
    insertConfig: { insertPoint },

    draggingClass: 'ff-array__dragging',
    dragPlaceholderClass: 'ff-array__placeholder',
    synthDragPlaceholderClass: 'ff-array__placeholder',
    dropZoneParentClass: 'ff-array__zone',
    synthDropZoneParentClass: 'ff-array__zone',

    // Do NOT sync vee-validate here — keep drag smooth.
    onSort() {
      isDragging.value = true
    },

    // Sync once, at the end.
    onDragend() {
      isDragging.value = false
      commitDndOrderToVee()
    }
  })
} else {
  arrayContainer = ref<HTMLElement>()
  dndKeys = ref<DndKey[]>(veeKeys.value)
}

// Keep the DnD key list in sync with add/remove coming from vee-validate.
// Preserve current DnD order when possible; append new keys at the end.
watch(
  veeKeys,
  (newKeys) => {
    const current = dndKeys.value.slice()
    const newKeySet = new Set(newKeys)

    // Remove keys that no longer exist
    const next = current.filter((k) => newKeySet.has(k))

    // Append any new keys
    const nextSet = new Set(next)
    for (const k of newKeys) {
      if (!nextSet.has(k)) next.push(k)
    }

    // Ensure lengths match exactly
    dndKeys.value = next.length === newKeys.length ? next : newKeys.slice()
  },
  { immediate: true }
)

// Map key -> current vee index so inputs stay bound to correct index during drag
const keyToVeeIndex = computed(() => {
  const map = new Map<DndKey, number>()
  fields.value.forEach((f, i) => {
    map.set(String(f.key), i)
  })
  return map
})

// Render model: ordered list of { key, fieldItem, veeIndex }
const orderedItems = computed(() => {
  return dndKeys.value
    .map((k) => {
      const idx = keyToVeeIndex.value.get(k)
      if (idx === undefined) return null
      return { key: k, veeIndex: idx, fieldItem: fields.value[idx] }
    })
    .filter(Boolean) as Array<{
    key: DndKey
    veeIndex: number
    fieldItem: (typeof fields.value)[number]
  }>
})

// Commit order to vee-validate ONCE (drop), using move() so vee-validate can reindex cleanly.
function commitDndOrderToVee() {
  if (!isSortable.value) return

  const desired = dndKeys.value.slice()
  const current = fields.value.map((f) => String(f.key))

  // Transform current -> desired with minimal move() operations
  const working = current.slice()
  for (let targetIndex = 0; targetIndex < desired.length; targetIndex++) {
    const key = desired[targetIndex]
    if (!key) continue
    const fromIndex = working.indexOf(key)
    if (fromIndex === -1) continue
    if (fromIndex !== targetIndex) {
      move(fromIndex, targetIndex)
      const [moved] = working.splice(fromIndex, 1)
      working.splice(targetIndex, 0, moved!)
    }
  }

  // Validate after vee has settled
  nextTick(() => {
    validateArrayField()
  })
}

function addItem() {
  let defaultValue: unknown = ''

  // Check if explicit defaultValue is provided
  if ('defaultValue' in props.meta.itemField) {
    defaultValue = props.meta.itemField.defaultValue
  } else if (props.meta.itemField.type === 'field-group') {
    // For field-groups, recursively extract defaults from all nested fields
    defaultValue = {}
    if ('fields' in props.meta.itemField && props.meta.itemField.fields) {
      defaultValue = extractDefaultValues(props.meta.itemField.fields)
    }
  }

  push(defaultValue)
  validateArrayField()
}

function removeItem(index: number) {
  remove(index)
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
      <div
        ref="arrayContainer"
        v-auto-animate="isSortable ? { duration: isDragging ? 0 : 180 } : { duration: 180 }"
        :class="cn('grid gap-2', meta.class)"
      >
        <div
          v-for="item in orderedItems"
          :key="item.key"
          :class="isSortable ? 'ff-array__item' : 'ff-array__item--simple'"
        >
          <span v-if="isSortable" class="drag-handle ff-array__handle">
            <Icon name="lucide:grip-vertical" class="h-5 w-5" />
          </span>

          <div class="min-w-0 flex-1">
            <!-- IMPORTANT:
                 Bind to veeIndex so values don't "swap" during drag.
                 After drop, we commit ordering to vee-validate once.
                 Wrapper key is stable (item.key) for DnD node tracking.
                 FormField key includes veeIndex to force component re-creation on reorder,
                 ensuring FormFieldGroup labels resolve with fresh scoped values. -->
            <FormField
              :key="`${item.key}-${item.veeIndex}`"
              :name="`${name}[${item.veeIndex}]`"
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
@reference '@/assets/css/main.css';

.ff-array__item {
  @apply relative flex items-start rounded-lg border bg-card px-0 transition-colors hover:bg-accent/5;
}

/* Non-sortable items: no drag handle, simpler layout */
.ff-array__item--simple {
  @apply relative flex items-start rounded-lg border bg-card px-3 transition-colors hover:bg-accent/5;
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
