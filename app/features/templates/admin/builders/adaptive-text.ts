/**
 * Shrink adaptive certificate text to fit available width.
 *
 * Runs in both preview (client) and PDF rendering (headless browser).
 */
export function fitAdaptiveText(root: ParentNode = document): void {
  const elements = root.querySelectorAll<HTMLElement>('.cert-adaptive')

  elements.forEach((el) => {
    const parent = el.parentElement
    if (!parent) return

    const maxWidth = parent.offsetWidth
    if (maxWidth <= 0) return

    const minFont = parseFloat(el.getAttribute('data-min-font') || '8')

    el.style.fontSize = ''
    el.style.whiteSpace = 'nowrap'
    el.style.display = 'inline-block'
    el.style.wordBreak = ''

    void el.offsetWidth

    let fontSize = parseFloat(getComputedStyle(el).fontSize)
    const originalSize = fontSize

    while (el.scrollWidth > maxWidth && fontSize > minFont) {
      fontSize -= 0.5
      el.style.fontSize = `${fontSize}px`
    }

    if (el.scrollWidth > maxWidth) {
      el.style.fontSize = `${originalSize}px`
      el.style.whiteSpace = 'normal'
      el.style.wordBreak = 'break-word'
    }
  })
}

export const ADAPTIVE_TEXT_SCRIPT = /* js */ `
<script>
window.__fitCertificateAdaptiveText = ${fitAdaptiveText.toString()};
window.__fitCertificateAdaptiveText(document);
</script>`
