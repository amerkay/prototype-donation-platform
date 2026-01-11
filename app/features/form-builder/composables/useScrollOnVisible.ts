import { ref, computed, watch, nextTick, type Ref } from 'vue'

interface ScrollOnVisibleOptions<T> {
  isVisible: (item: T) => boolean
  getKey: (item: T) => string
  scrollDelay?: number
  scrollOffset?: number
}

/**
 * Scroll element into view with minimal movement
 * Only scrolls if not fully visible, maintains 50px margin
 */
function scrollToElement(element: HTMLElement, offset: number = 50) {
  const rect = element.getBoundingClientRect()
  const scrollContainer = element.closest('.overflow-y-auto, .overflow-auto') as HTMLElement | null

  if (scrollContainer) {
    const containerRect = scrollContainer.getBoundingClientRect()
    const topIsVisible = rect.top >= containerRect.top + offset
    const bottomIsVisible = rect.bottom <= containerRect.bottom - offset

    if (!topIsVisible) {
      // Scroll up to show top with margin
      const targetPosition = scrollContainer.scrollTop + (rect.top - containerRect.top) - offset
      scrollContainer.scrollTo({ top: targetPosition, behavior: 'smooth' })
    } else if (!bottomIsVisible) {
      // Scroll down to show bottom with margin
      const targetPosition =
        scrollContainer.scrollTop + (rect.bottom - containerRect.bottom) + offset

      // Don't scroll so far down that the element's top (e.g., an accordion trigger)
      // scrolls out of view.
      const maxPositionToKeepTopVisible =
        scrollContainer.scrollTop + (rect.top - containerRect.top) - offset

      const clampedTargetPosition = Math.min(targetPosition, maxPositionToKeepTopVisible)
      scrollContainer.scrollTo({ top: clampedTargetPosition, behavior: 'smooth' })
    }
  } else if (typeof window !== 'undefined') {
    const topIsVisible = rect.top >= offset
    const bottomIsVisible = rect.bottom <= window.innerHeight - offset

    if (!topIsVisible) {
      // Scroll up to show top with margin
      const targetPosition = window.scrollY + rect.top - offset
      window.scrollTo({ top: targetPosition, behavior: 'smooth' })
    } else if (!bottomIsVisible) {
      // Scroll down to show bottom with margin
      const targetPosition = window.scrollY + (rect.bottom - window.innerHeight) + offset

      // Don't scroll so far down that the element's top scrolls out of view.
      const maxPositionToKeepTopVisible = window.scrollY + rect.top - offset

      const clampedTargetPosition = Math.min(targetPosition, maxPositionToKeepTopVisible)
      window.scrollTo({ top: clampedTargetPosition, behavior: 'smooth' })
    }
  }
}

/**
 * Auto-scroll to newly visible items with ref tracking
 */
export function useScrollOnVisible<T>(items: Ref<T[]>, options: ScrollOnVisibleOptions<T>) {
  const { isVisible, getKey, scrollDelay = 250, scrollOffset = 50 } = options
  const elementRefs = ref<Record<string, HTMLElement | null>>({})

  const visibleKeys = computed(() => items.value.filter(isVisible).map(getKey))

  watch(
    visibleKeys,
    (newKeys, oldKeys) => {
      const oldKeySet = new Set(oldKeys || [])
      const newlyVisible = newKeys.filter((key) => !oldKeySet.has(key))
      const lastKey = newlyVisible[newlyVisible.length - 1]

      if (lastKey) {
        setTimeout(() => {
          nextTick(() => {
            const element = elementRefs.value[lastKey]
            if (element) scrollToElement(element, scrollOffset)
          })
        }, scrollDelay)
      }
    },
    { deep: true }
  )

  return {
    setElementRef: (key: string, el: HTMLElement | { $el: HTMLElement } | null) => {
      // Defer element extraction to avoid interfering with Vue's DOM updates
      // This prevents "Node.insertBefore" errors during portal/teleport operations
      nextTick(() => {
        // Extract HTMLElement from component instance or use directly
        const htmlElement = el && typeof el === 'object' && '$el' in el ? el.$el : el
        elementRefs.value[key] = htmlElement instanceof HTMLElement ? htmlElement : null
      })
    },
    scrollToElement: (key: string, customOffset?: number) => {
      const element = elementRefs.value[key]
      if (element instanceof HTMLElement) {
        scrollToElement(element, customOffset ?? scrollOffset)
      }
    }
  }
}
