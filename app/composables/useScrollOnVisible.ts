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
   * Additional offset when scrolling (px)
   * @default 75
   */
  scrollOffset?: number
}

/**
 * Composable for auto-scrolling to newly visible items in a list
 *
 * @example
 * const { elementRefs, setElementRef } = useScrollOnVisible({
 *   items: fields,
 *   isVisible: (field) => !field.hidden,
 *   getKey: (field) => field.id
 * })
 */
export function useScrollOnVisible<T>(items: Ref<T[]>, options: ScrollOnVisibleOptions<T>) {
  const { isVisible, getKey, scrollDelay = 150, scrollOffset = 75 } = options

  // Track element refs for auto-scroll functionality
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
        // Scroll to the last newly visible item after a delay
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
    elementRefs,
    setElementRef,
    visibleKeys
  }
}

/**
 * Scrolls to an element within its scroll container
 */
function scrollToElement(element: HTMLElement, offset: number = 75) {
  const rect = element.getBoundingClientRect()
  const scrollContainer = element.closest(
    '[data-radix-scroll-area-viewport], .overflow-y-auto, .overflow-auto'
  )

  if (scrollContainer) {
    const containerRect = scrollContainer.getBoundingClientRect()
    const scrollTop = scrollContainer.scrollTop + rect.bottom - containerRect.top + offset
    scrollContainer.scrollTo({ top: scrollTop, behavior: 'smooth' })
  }
}
