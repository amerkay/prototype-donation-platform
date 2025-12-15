import { ref, computed, watch, nextTick, type Ref } from 'vue'

interface ScrollOnVisibleOptions<T> {
  isVisible: (item: T) => boolean
  getKey: (item: T) => string
  scrollDelay?: number
  scrollOffset?: number
}

/**
 * Scroll element into view, keeping the top (trigger) visible
 * Always scrolls to show the top of the element with offset from viewport top
 */
function scrollToElement(element: HTMLElement, offset: number = 20) {
  const rect = element.getBoundingClientRect()
  const scrollContainer = element.closest('.overflow-y-auto, .overflow-auto') as HTMLElement | null

  if (scrollContainer) {
    const containerRect = scrollContainer.getBoundingClientRect()
    const elementTopRelativeToContainer = rect.top - containerRect.top
    const targetPosition = elementTopRelativeToContainer - offset

    // Only scroll if the element top is not already at the desired position
    if (Math.abs(targetPosition) > 1) {
      scrollContainer.scrollTo({
        top: scrollContainer.scrollTop + targetPosition,
        behavior: 'smooth'
      })
    }
  } else {
    const targetPosition = rect.top - offset

    // Only scroll if the element top is not already at the desired position
    if (Math.abs(targetPosition) > 1) {
      window.scrollTo({ top: window.scrollY + targetPosition, behavior: 'smooth' })
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
    setElementRef: (key: string, el: HTMLElement | { $el: HTMLElement } | null) => {
      // Extract HTMLElement from component instance or use directly
      const htmlElement = el && typeof el === 'object' && '$el' in el ? el.$el : el
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
