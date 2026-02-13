/**
 * Composable for shrinking adaptive text to fit available space.
 *
 * Works in both Vue preview (client) and PDF rendering (headless browser).
 *
 * Supports two modes via data attributes:
 * - Single-line: Shrinks text to fit width (default)
 * - Multi-line: Shrinks text to fit within a max line count (use `data-max-lines`)
 */

import { nextTick, onMounted, watch, type Ref } from 'vue'

/**
 * Shrink adaptive template text to fit available space.
 *
 * Runs on elements with class `template-adaptive`.
 *
 * Data attributes:
 * - `data-min-font`: Minimum font size in px (default: 8)
 * - `data-max-lines`: Maximum number of lines (enables multi-line mode)
 */
export function fitAdaptiveText(root: ParentNode = document): void {
  const elements = root.querySelectorAll<HTMLElement>('.template-adaptive')

  elements.forEach((el) => {
    const parent = el.parentElement
    if (!parent) return

    const maxWidth = parent.offsetWidth
    if (maxWidth <= 0) return

    const minFont = parseFloat(el.getAttribute('data-min-font') || '8')
    const maxLines = el.getAttribute('data-max-lines')

    if (maxLines) {
      fitMultiLineText(el, maxWidth, parseInt(maxLines, 10), minFont)
    } else {
      fitSingleLineText(el, maxWidth, minFont)
    }
  })
}

/**
 * Fit single-line text by shrinking font until it fits width.
 */
function fitSingleLineText(el: HTMLElement, maxWidth: number, minFont: number): void {
  // Reset styles for single-line mode
  el.style.fontSize = ''
  el.style.whiteSpace = 'nowrap'
  el.style.display = 'inline-block'
  el.style.wordBreak = ''
  el.style.overflow = ''
  el.style.textOverflow = ''

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
}

/**
 * Fit multi-line text by shrinking font until it fits within max lines.
 */
function fitMultiLineText(
  el: HTMLElement,
  maxWidth: number,
  maxLines: number,
  minFont: number
): void {
  // Reset styles for multi-line mode
  el.style.fontSize = ''
  el.style.whiteSpace = 'normal'
  el.style.wordBreak = 'normal'
  el.style.display = '-webkit-box'
  el.style.webkitLineClamp = String(maxLines)
  el.style.webkitBoxOrient = 'vertical'
  el.style.overflow = 'hidden'
  el.style.width = `${maxWidth}px`

  // Force layout recalc
  void el.offsetHeight

  let fontSize = parseFloat(getComputedStyle(el).fontSize)

  // Calculate max height based on line count
  const getMaxHeight = (fs: number) => {
    const lh = parseFloat(getComputedStyle(el).lineHeight) || fs * 1.2
    return lh * maxLines
  }

  // Shrink font until content fits within max lines or hits minimum
  while (el.scrollHeight > getMaxHeight(fontSize) + 2 && fontSize > minFont) {
    fontSize -= 0.5
    el.style.fontSize = `${fontSize}px`
    // Force layout recalc
    void el.offsetHeight
  }
}

/**
 * Composable that runs adaptive text fitting on mount and when dependencies change.
 *
 * @param containerRef - Ref to the container element containing `.template-adaptive` elements
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
    watch(dependencies, runFit)
  }

  return { runFit }
}
