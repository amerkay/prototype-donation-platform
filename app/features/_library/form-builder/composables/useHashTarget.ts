import {
  inject,
  provide,
  ref,
  computed,
  watch,
  nextTick,
  onMounted,
  onUnmounted,
  type Ref,
  type ComputedRef
} from 'vue'
import { useRoute } from '#app'
import type { FieldDef, FieldContext } from '../types'
import { checkFieldVisibility } from './useFieldPath'
import { scrollToElement } from './useScrollOnVisible'

// --- Constants ---
const HASH_TARGET_KEY = Symbol('hashTarget')
export const HASH_TARGET_PASSIVE_KEY = Symbol('hashTargetPassive')
const FLASH_DURATION_MS = 1500 // 3 × 500ms CSS pulses
const SCROLL_DELAY_MS = 350 // Wait for accordion/tab animation
const CLEAR_LISTENER_DELAY_MS = 2000 // Don't clear on navigation click

interface HashTargetContext {
  targetPath: Ref<string | null>
  cleared: Ref<boolean>
  activateTarget: (target: string) => void
}

let activeHashTargetActivator: ((target: string) => void) | null = null
let activeHashTargetFields: Record<string, FieldDef> | null = null
let activeHashTargetGetValues: (() => Record<string, unknown>) | null = null

export function activateHashTarget(target: string): boolean {
  if (!target || !activeHashTargetActivator) return false
  activeHashTargetActivator(target)
  return true
}

/**
 * Walk the field tree along the resolved path and check each field's visibleWhen.
 * Returns false if any field along the path is hidden by its visibleWhen condition.
 * Fields inside collapsed accordions remain valid — only visibleWhen is checked.
 */
function isFieldVisibleInTree(
  resolvedPath: string,
  fields: Record<string, FieldDef>,
  formValues: Record<string, unknown>
): boolean {
  const segments = resolvedPath.split('.')
  let currentFields = fields
  let currentValues: Record<string, unknown> = formValues

  for (let i = 0; i < segments.length; i++) {
    const segment = segments[i]!
    const field = currentFields[segment]
    if (!field) return true // Unknown field, assume visible

    const ctx: FieldContext = { values: currentValues, root: formValues }
    if (!checkFieldVisibility(field, ctx, { skipContainerValidation: true })) {
      return false
    }

    // Descend into children for next segment
    if (field.type === 'field-group' && 'fields' in field && field.fields) {
      currentFields = field.fields as Record<string, FieldDef>
      currentValues = (currentValues[segment] as Record<string, unknown>) || {}
    } else if (field.type === 'tabs' && 'tabs' in field) {
      // Next segment is the tab value — find matching tab and descend
      const nextSegment = segments[i + 1]
      if (nextSegment) {
        const typedField = field as {
          tabs: Array<{ value: string; fields: Record<string, FieldDef> }>
        }
        const tab = typedField.tabs.find((t) => t.value === nextSegment)
        if (tab) {
          currentFields = tab.fields
          currentValues = (currentValues[segment] as Record<string, unknown>) || {}
          i++ // Skip the tab segment
        }
      }
    }
  }
  return true
}

/** Check if a hash target path would resolve and is not hidden by visibleWhen */
export function canResolveHashTarget(target: string): boolean {
  if (!target || !activeHashTargetFields) return false
  const resolved = resolveHash(target, activeHashTargetFields)
  if (!resolved) return false
  if (!activeHashTargetGetValues) return true
  return isFieldVisibleInTree(resolved, activeHashTargetFields, activeHashTargetGetValues())
}

// --- Hash Resolution ---

/**
 * Walk field tree to resolve URL hash to full field path.
 * Two-pass: exact path match first, then field-name-only fallback.
 */
function resolveHashToFieldPath(
  hash: string,
  fields: Record<string, FieldDef>,
  prefix = '',
  nameOnly = false
): string | null {
  for (const [key, field] of Object.entries(fields)) {
    const fullPath = prefix ? `${prefix}.${key}` : key

    if (nameOnly ? key === hash : fullPath === hash) return fullPath

    if (field.type === 'field-group' && 'fields' in field && field.fields) {
      const found = resolveHashToFieldPath(hash, field.fields, fullPath, nameOnly)
      if (found) return found
    }

    if (field.type === 'tabs' && 'tabs' in field) {
      for (const tab of field.tabs) {
        const tabPath = `${fullPath}.${tab.value}`
        if (nameOnly ? tab.value === hash : tabPath === hash) return tabPath
        const found = resolveHashToFieldPath(hash, tab.fields, tabPath, nameOnly)
        if (found) return found
      }
    }

    // Support dot-notation array index paths: e.g., costs.0, costs.1
    if (field.type === 'array') {
      if (hash.startsWith(`${fullPath}.`)) {
        const indexSegment = hash.slice(fullPath.length + 1).split('.')[0]
        if (indexSegment && /^\d+$/.test(indexSegment)) return hash
      }
    }
  }
  return null
}

function resolveHash(hash: string, fields: Record<string, FieldDef>): string | null {
  if (!hash) return null
  const cleanHash = decodeURIComponent(hash.startsWith('#') ? hash.slice(1) : hash)
  return (
    resolveHashToFieldPath(cleanHash, fields) ?? resolveHashToFieldPath(cleanHash, fields, '', true)
  )
}

// --- Provider ---

/**
 * Provide hash target context. Call once in FormRenderer.
 * Resolves URL hash to field path and manages clear-on-interaction.
 */
export function provideHashTarget(
  fields: Record<string, FieldDef>,
  getFormValues?: () => Record<string, unknown>
) {
  const isPassive = inject<boolean>(HASH_TARGET_PASSIVE_KEY, false)
  const route = useRoute()
  const targetPath = ref<string | null>(null)
  const cleared = ref(false)
  let clearListenerTimeout: ReturnType<typeof setTimeout> | null = null

  const clearHighlight = () => {
    cleared.value = true
    document.removeEventListener('click', clearHighlight)
    document.removeEventListener('keydown', clearHighlight)
  }

  const applyTarget = (nextTarget: string | null) => {
    cleared.value = false
    targetPath.value = nextTarget

    if (clearListenerTimeout) {
      clearTimeout(clearListenerTimeout)
      clearListenerTimeout = null
    }

    if (targetPath.value) {
      clearListenerTimeout = setTimeout(() => {
        if (!cleared.value) {
          document.addEventListener('click', clearHighlight)
          document.addEventListener('keydown', clearHighlight)
        }
      }, CLEAR_LISTENER_DELAY_MS)
    }
  }

  const setResolvedTarget = (nextTarget: string | null) => {
    // Reset existing clear listeners so a stale listener from a previous activation
    // can't immediately clear the new target during the same click event.
    document.removeEventListener('click', clearHighlight)
    document.removeEventListener('keydown', clearHighlight)

    // Force re-activation when targeting the same path (e.g. clicking a hash link
    // while already on that hash). Null first so Vue detects the change on nextTick.
    if (nextTarget && (targetPath.value === nextTarget || cleared.value)) {
      targetPath.value = null
      cleared.value = false
      nextTick(() => applyTarget(nextTarget))
    } else {
      applyTarget(nextTarget)
    }
  }

  const activateTarget = (target: string) => {
    setResolvedTarget(resolveHash(target, fields))
  }

  provide<HashTargetContext>(HASH_TARGET_KEY, { targetPath, cleared, activateTarget })

  onMounted(() => {
    if (!isPassive) {
      activeHashTargetActivator = activateTarget
      activeHashTargetFields = fields
      activeHashTargetGetValues = getFormValues || null
    }

    watch(
      () => route.hash,
      (hash) => {
        setResolvedTarget(resolveHash(hash, fields))
      },
      { immediate: true }
    )
  })

  onUnmounted(() => {
    if (clearListenerTimeout) {
      clearTimeout(clearListenerTimeout)
    }
    document.removeEventListener('click', clearHighlight)
    document.removeEventListener('keydown', clearHighlight)
    if (!isPassive && activeHashTargetActivator === activateTarget) {
      activeHashTargetActivator = null
      activeHashTargetFields = null
      activeHashTargetGetValues = null
    }
  })
}

// --- Consumer ---

/**
 * Check if field path matches or contains hash target.
 * With `animate: true`, provides elementRef and highlight classes.
 */
export function useHashTarget(fullPath: ComputedRef<string>, options: { animate?: boolean } = {}) {
  const sectionId = inject<string>('sectionId', '')
  const { targetPath, cleared, activateTarget } = inject<HashTargetContext>(HASH_TARGET_KEY, {
    targetPath: ref(null),
    cleared: ref(false),
    activateTarget: () => {}
  })

  const relativePath = computed(() => {
    const fp = fullPath.value
    return sectionId && fp.startsWith(`${sectionId}.`) ? fp.slice(sectionId.length + 1) : fp
  })

  const isHashTarget = computed(() =>
    Boolean(targetPath.value && !cleared.value && relativePath.value === targetPath.value)
  )

  const isAncestorOfHashTarget = computed(() => {
    if (!targetPath.value) return false
    const target = targetPath.value
    const rel = relativePath.value
    return target === rel || target.startsWith(`${rel}.`)
  })

  const hashTargetChildSegment = computed(() => {
    if (!targetPath.value || !isAncestorOfHashTarget.value) return null
    const remaining = targetPath.value.slice(relativePath.value.length)
    return remaining.startsWith('.') ? remaining.slice(1).split('.')[0] : null
  })

  const fieldId = computed(() => relativePath.value || null)

  // Non-animated: return detection only
  if (!options.animate) {
    return {
      isHashTarget,
      isAncestorOfHashTarget,
      hashTargetChildSegment,
      cleared,
      fieldId,
      activateTarget
    }
  }

  // Animated: add highlight classes and scroll behavior
  const elementRef = ref<HTMLElement | null>(null)
  const isFlashing = ref(false)

  const hashHighlightClass = computed(() => {
    if (!isHashTarget.value) return ''
    const base = 'ring-offset-card ring-offset-10 rounded'
    return isFlashing.value
      ? `${base} ring-2 ring-primary hash-highlight-flash`
      : `${base} ring-1 ring-primary/50`
  })

  watch(
    isHashTarget,
    (active) => {
      if (!active) {
        isFlashing.value = false
        return
      }

      // Start flash animation, CSS handles 3x pulse
      isFlashing.value = true
      setTimeout(() => {
        isFlashing.value = false
      }, FLASH_DURATION_MS)

      // Scroll after accordion/tab expansion settles
      nextTick(() => {
        setTimeout(() => {
          const el = elementRef.value
          const htmlEl = el && ('$el' in el ? (el.$el as HTMLElement) : el)
          if (htmlEl) scrollToElement(htmlEl)
        }, SCROLL_DELAY_MS)
      })
    },
    { immediate: true, flush: 'post' }
  )

  return {
    isHashTarget,
    isAncestorOfHashTarget,
    hashTargetChildSegment,
    cleared,
    fieldId,
    activateTarget,
    elementRef,
    hashHighlightClass
  }
}
