import { ref, computed, onMounted, onUnmounted, type Ref, type CSSProperties } from 'vue'
import { useRouter } from '#app'

/**
 * Makes preview elements with `data-field` attributes interactive.
 * Hover shows a dashed outline + floating edit button; click navigates
 * via URL hash which triggers the form-builder's useHashTarget system.
 */
export function usePreviewEditable(containerRef: Ref<HTMLElement | null>, enabled: Ref<boolean>) {
  const router = useRouter()
  const hoveredField = ref<string | null>(null)
  const hoveredRect = ref<DOMRect | null>(null)

  function findFieldElement(target: EventTarget | null): HTMLElement | null {
    let el = target as HTMLElement | null
    while (el && el !== containerRef.value) {
      if (el.dataset?.field) return el
      el = el.parentElement
    }
    return null
  }

  function onMouseOver(e: MouseEvent) {
    if (!enabled.value) return
    const el = findFieldElement(e.target)
    if (el) {
      hoveredField.value = el.dataset.field!
      hoveredRect.value = el.getBoundingClientRect()
    }
  }

  function onMouseOut(e: MouseEvent) {
    if (!enabled.value) return
    const el = findFieldElement(e.relatedTarget)
    if (!el || el.dataset.field !== hoveredField.value) {
      hoveredField.value = null
      hoveredRect.value = null
    }
  }

  function onClick(e: MouseEvent) {
    if (!enabled.value) return
    const el = findFieldElement(e.target)
    if (el?.dataset.field) {
      e.preventDefault()
      navigateToField(el.dataset.field)
    }
  }

  function navigateToField(field?: string) {
    const target = field ?? hoveredField.value
    if (target) router.replace({ hash: `#${target}` })
  }

  const editButtonStyle = computed<CSSProperties>(() => {
    if (!hoveredRect.value || !containerRef.value) return { display: 'none' }
    const containerRect = containerRef.value.getBoundingClientRect()
    return {
      position: 'absolute',
      top: `${hoveredRect.value.top - containerRect.top + 4}px`,
      right: `${containerRect.right - hoveredRect.value.right + 4}px`,
      zIndex: 50
    }
  })

  const hoverOutlineStyle = computed<CSSProperties>(() => {
    if (!hoveredRect.value || !containerRef.value) return { display: 'none' }
    const containerRect = containerRef.value.getBoundingClientRect()
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
    const el = containerRef.value
    if (!el) return
    el.addEventListener('mouseover', onMouseOver)
    el.addEventListener('mouseout', onMouseOut)
    el.addEventListener('click', onClick)
  })

  onUnmounted(() => {
    const el = containerRef.value
    if (!el) return
    el.removeEventListener('mouseover', onMouseOver)
    el.removeEventListener('mouseout', onMouseOut)
    el.removeEventListener('click', onClick)
  })

  return { hoveredField, editButtonStyle, hoverOutlineStyle, navigateToField }
}
