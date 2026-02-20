import { ref, computed, onMounted, onUnmounted, type Ref, type CSSProperties } from 'vue'
import {
  activateHashTarget,
  canResolveHashTarget
} from '~/features/_library/form-builder/composables/useHashTarget'

/**
 * Makes preview elements with `data-field` attributes interactive.
 * Hover shows a dashed outline + floating edit button; click triggers
 * the form-builder hash-target scroll/highlight logic without URL changes.
 */
export function usePreviewEditable(containerRef: { value: Element | null }, enabled: Ref<boolean>) {
  const hoveredField = ref<string | null>(null)
  const hoveredRect = ref<DOMRect | null>(null)
  let hoveredEl: HTMLElement | null = null

  function getContainerElement(): Element | null {
    const container = containerRef.value
    if (!container) return null
    if (container instanceof Element) return container

    // Support refs pointing to Vue component instances (e.g., shadcn Card)
    const maybeComponent = container as unknown as { $el?: unknown }
    return maybeComponent.$el instanceof Element ? maybeComponent.$el : null
  }

  function findFieldElement(target: EventTarget | null): HTMLElement | null {
    const containerEl = getContainerElement()
    if (!containerEl) return null

    let el = target as HTMLElement | null
    while (el && el !== containerEl) {
      if (el.dataset?.field) return el
      el = el.parentElement
    }
    return null
  }

  /** For comma-separated data-field values, return the first resolvable target. */
  function resolveFirstTarget(csv: string): string | null {
    const candidates = csv.split(',')
    for (const c of candidates) {
      if (canResolveHashTarget(c)) return c
    }
    return null
  }

  function hashTargetExists(fieldPath: string): boolean {
    return resolveFirstTarget(fieldPath) !== null
  }

  function onMouseOver(e: Event) {
    if (!enabled.value) return
    const mouseEvent = e as MouseEvent
    const el = findFieldElement(mouseEvent.target)
    if (el && hashTargetExists(el.dataset.field!)) {
      if (hoveredEl && hoveredEl !== el) hoveredEl.classList.remove('field-editable')
      hoveredEl = el
      hoveredEl.classList.add('field-editable')
      hoveredField.value = el.dataset.field!
      hoveredRect.value = el.getBoundingClientRect()
    }
  }

  function onMouseOut(e: Event) {
    if (!enabled.value) return
    const mouseEvent = e as MouseEvent
    const el = findFieldElement(mouseEvent.relatedTarget)
    if (!el || el.dataset.field !== hoveredField.value) {
      if (hoveredEl) hoveredEl.classList.remove('field-editable')
      hoveredEl = null
      hoveredField.value = null
      hoveredRect.value = null
    }
  }

  function onClick(e: Event) {
    if (!enabled.value) return
    const target = e.target as HTMLElement
    if (target.closest('[data-preview-nav]')) return
    // Navigate to specific field under cursor, or current hovered field (e.g. edit button click)
    const el = findFieldElement(e.target)
    const field = el?.dataset.field ?? hoveredField.value
    if (field && hashTargetExists(field)) {
      e.stopPropagation()
      e.preventDefault()
      navigateToField(field)
    }
  }

  function navigateToField(field?: string) {
    const csv = field ?? hoveredField.value
    if (!csv) return
    const target = resolveFirstTarget(csv)
    if (target) activateHashTarget(target)
  }

  const editButtonStyle = computed<CSSProperties>(() => {
    const containerEl = getContainerElement()
    if (!hoveredRect.value || !containerEl) return { display: 'none' }
    const containerRect = containerEl.getBoundingClientRect()
    return {
      position: 'absolute',
      top: `${hoveredRect.value.top - containerRect.top + 4}px`,
      right: `${containerRect.right - hoveredRect.value.right + 4}px`,
      zIndex: 50
    }
  })

  const hoverOutlineStyle = computed<CSSProperties>(() => {
    const containerEl = getContainerElement()
    if (!hoveredRect.value || !containerEl) return { display: 'none' }
    const containerRect = containerEl.getBoundingClientRect()
    return {
      position: 'absolute',
      top: `${hoveredRect.value.top - containerRect.top}px`,
      left: `${hoveredRect.value.left - containerRect.left}px`,
      width: `${hoveredRect.value.width}px`,
      height: `${hoveredRect.value.height}px`,
      pointerEvents: 'none',
      zIndex: 40
    }
  })

  onMounted(() => {
    const el = getContainerElement()
    if (!el) return
    el.addEventListener('mouseover', onMouseOver)
    el.addEventListener('mouseout', onMouseOut)
    el.addEventListener('click', onClick, true)
  })

  onUnmounted(() => {
    const el = getContainerElement()
    if (!el) return
    el.removeEventListener('mouseover', onMouseOver)
    el.removeEventListener('mouseout', onMouseOut)
    el.removeEventListener('click', onClick, true)
  })

  return { hoveredField, editButtonStyle, hoverOutlineStyle, navigateToField }
}
