import { ref, computed, watch, nextTick, type Ref } from 'vue'

interface ScrollOnVisibleOptions<T> {
  /**
   * Function that determines if an item is visible based on current state
   */
  isVisible: (item: T) => boolean
  /**
   * Function that extracts a unique key from an item
   */
  getKey: (item: T) => string
  /**
   * Delay before scrolling (ms)
   * @default 150
   */
  scrollDelay?: number
  /**
   * Additional offset in pixels (padding from top)
   * @default 20
   */
  scrollOffset?: number
}

/**
 * Scrolls only enough to bring an element into view without hiding its trigger
 * @param element - The element to scroll to
 * @param offset - Padding in pixels
 */
export function scrollToElement(element: HTMLElement, offset: number = 20) {
  const rect = element.getBoundingClientRect()
  const scrollContainer = element.closest(
    '[data-radix-scroll-area-viewport], .overflow-y-auto, .overflow-auto'
  ) as HTMLElement | null

  if (scrollContainer) {
    // Scroll within container
    const containerRect = scrollContainer.getBoundingClientRect()
    const elementTop = rect.top - containerRect.top
    const elementBottom = rect.bottom - containerRect.top
    const containerHeight = containerRect.height

    // Check if element is already fully visible
    if (elementTop >= offset && elementBottom <= containerHeight - offset) {
      return // Already visible, no scroll needed
    }

    // Calculate scroll needed
    let scrollAmount = 0
    if (elementBottom > containerHeight - offset) {
      // Element bottom is below viewport - scroll down just enough
      scrollAmount = elementBottom - containerHeight + offset
    } else if (elementTop < offset) {
      // Element top is above viewport - scroll up
      scrollAmount = elementTop - offset
    }

    const newScrollTop = scrollContainer.scrollTop + scrollAmount
    scrollContainer.scrollTo({ top: newScrollTop, behavior: 'smooth' })
  } else {
    // Fallback to window scroll
    const viewportHeight = window.innerHeight
    const elementTop = rect.top
    const elementBottom = rect.bottom

    // Check if element is already fully visible
    if (elementTop >= offset && elementBottom <= viewportHeight - offset) {
      return // Already visible, no scroll needed
    }

    // Calculate scroll needed
    let scrollAmount = 0
    if (elementBottom > viewportHeight - offset) {
      // Element bottom is below viewport - scroll down just enough
      scrollAmount = elementBottom - viewportHeight + offset
    } else if (elementTop < offset) {
      // Element top is above viewport - scroll up
      scrollAmount = elementTop - offset
    }

    const newScrollTop = window.scrollY + scrollAmount
    window.scrollTo({ top: newScrollTop, behavior: 'smooth' })
  }
}

/**
 * Composable for auto-scrolling to newly visible items
 *
 * @example
 * const { setElementRef } = useScrollOnVisible(fields, {
 *   isVisible: ([, meta]) => !meta.hidden,
 *   getKey: ([key]) => key
 * })
 */
export function useScrollOnVisible<T>(items: Ref<T[]>, options: ScrollOnVisibleOptions<T>) {
  const { isVisible, getKey, scrollDelay = 150, scrollOffset = 20 } = options

  // Track element refs
  const elementRefs = ref<Record<string, HTMLElement | null>>({})

  const setElementRef = (key: string, el: HTMLElement | null) => {
    elementRefs.value[key] = el
  }

  // Track which items are currently visible
  const visibleKeys = computed(() => {
    return items.value.filter((item) => isVisible(item)).map((item) => getKey(item))
  })

  // Auto-scroll when new items become visible
  watch(
    visibleKeys,
    async (newKeys, oldKeys) => {
      // Find newly visible items
      const oldKeySet = new Set(oldKeys || [])
      const newlyVisible = newKeys.filter((key) => !oldKeySet.has(key))

      if (newlyVisible.length > 0) {
        // Scroll to the last newly visible item
        const lastKey = newlyVisible[newlyVisible.length - 1]
        if (lastKey) {
          setTimeout(() => {
            nextTick(() => {
              const element = elementRefs.value[lastKey]
              if (element) {
                scrollToElement(element, scrollOffset)
              }
            })
          }, scrollDelay)
        }
      }
    },
    { deep: true }
  )

  return {
    setElementRef
  }
}
