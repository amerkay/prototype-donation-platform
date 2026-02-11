/**
 * Composable for shrinking adaptive text to fit available width.
 *
 * Works in both Vue preview (client) and PDF rendering (headless browser).
 */

import { nextTick, onMounted, watch, type Ref } from 'vue'

/**
 * Shrink adaptive certificate text to fit available width.
 *
 * Runs on elements with class `cert-adaptive`. Reads `data-min-font` attribute
 * for minimum font size (defaults to 8px).
 */
export function fitAdaptiveText(root: ParentNode = document): void {
  const elements = root.querySelectorAll<HTMLElement>('.cert-adaptive')

  elements.forEach((el) => {
    const parent = el.parentElement
    if (!parent) return

    const maxWidth = parent.offsetWidth
    if (maxWidth <= 0) return

    const minFont = parseFloat(el.getAttribute('data-min-font') || '8')

    // Reset styles
    el.style.fontSize = ''
    el.style.whiteSpace = 'nowrap'
    el.style.display = 'inline-block'
    el.style.wordBreak = ''

    // Force layout recalc
    void el.offsetWidth

    let fontSize = parseFloat(getComputedStyle(el).fontSize)

    // Shrink font until it fits or hits minimum
    while (el.scrollWidth > maxWidth && fontSize > minFont) {
      fontSize -= 0.5
      el.style.fontSize = `${fontSize}px`
    }

    // If still too wide at minimum font, allow wrapping but never break words
    if (el.scrollWidth > maxWidth) {
      el.style.whiteSpace = 'normal'
      el.style.wordBreak = 'normal'
    }
  })
}

/**
 * Composable that runs adaptive text fitting on mount and when dependencies change.
 *
 * @param containerRef - Ref to the container element containing `.cert-adaptive` elements
 * @param dependencies - Array of refs to watch for changes (triggers re-fit)
 */
export function useAdaptiveText(
  containerRef: Ref<HTMLElement | null>,
  dependencies: Ref<unknown>[] = []
): { runFit: () => void } {
  const runFit = () => {
    const container = containerRef.value
    if (!container) return

    nextTick(() => {
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          fitAdaptiveText(container)
        })
      })
    })
  }

  onMounted(runFit)

  if (dependencies.length > 0) {
    watch(dependencies, runFit, { flush: 'post' })
  }

  return { runFit }
}
