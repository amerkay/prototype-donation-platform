import { ref, computed, watch, nextTick, type Ref } from 'vue'

interface ScrollOnVisibleOptions<T> {
  isVisible: (item: T) => boolean
  getKey: (item: T) => string
  scrollDelay?: number
  scrollOffset?: number
}

/**
 * Calculate scroll amount needed to bring element into view
 */
function calculateScrollAmount(
  elementTop: number,
  elementBottom: number,
  viewportHeight: number,
  offset: number
): number {
  if (elementTop >= offset && elementBottom <= viewportHeight - offset) {
    return 0 // Already visible
  }
  if (elementBottom > viewportHeight - offset) {
    return elementBottom - viewportHeight + offset // Scroll down
  }
  if (elementTop < offset) {
    return elementTop - offset // Scroll up
  }
  return 0
}

/**
 * Scroll element into view with minimal movement
 */
function scrollToElement(element: HTMLElement, offset: number = 20) {
  const rect = element.getBoundingClientRect()
  const scrollContainer = element.closest(
    '[data-radix-scroll-area-viewport], .overflow-y-auto, .overflow-auto'
  ) as HTMLElement | null

  if (scrollContainer) {
    const containerRect = scrollContainer.getBoundingClientRect()
    const scrollAmount = calculateScrollAmount(
      rect.top - containerRect.top,
      rect.bottom - containerRect.top,
      containerRect.height,
      offset
    )
    if (scrollAmount !== 0) {
      scrollContainer.scrollTo({
        top: scrollContainer.scrollTop + scrollAmount,
        behavior: 'smooth'
      })
    }
  } else {
    const scrollAmount = calculateScrollAmount(rect.top, rect.bottom, window.innerHeight, offset)
    if (scrollAmount !== 0) {
      window.scrollTo({ top: window.scrollY + scrollAmount, behavior: 'smooth' })
    }
  }
}

/**
 * Auto-scroll to newly visible items with ref tracking
 */
export function useScrollOnVisible<T>(items: Ref<T[]>, options: ScrollOnVisibleOptions<T>) {
  const { isVisible, getKey, scrollDelay = 150, scrollOffset = 20 } = options
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
    setElementRef: (key: string, el: any) => {
      // Extract HTMLElement from component instance or use directly
      const htmlElement = el?.$el || el
      elementRefs.value[key] = htmlElement instanceof HTMLElement ? htmlElement : null
    },
    scrollToElement: (key: string, customOffset?: number) => {
      const element = elementRefs.value[key]
      if (element instanceof HTMLElement) {
        scrollToElement(element, customOffset ?? scrollOffset)
      }
    }
  }
}
