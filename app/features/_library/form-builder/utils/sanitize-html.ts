/**
 * HTML sanitizer for rich-text field output
 *
 * Uses the browser's DOMParser to parse and walk the HTML tree,
 * stripping everything except a strict whitelist of tags and attributes.
 * Prevents XSS from stored HTML (e.g., tampered store/API values).
 *
 * Safe for v-html rendering of rich-text field output.
 */

const ALLOWED_TAGS = new Set(['p', 'strong', 'em', 'u', 'a', 'span', 'br'])

const ALLOWED_ATTRS: Record<string, Set<string>> = {
  a: new Set(['href', 'target', 'rel']),
  span: new Set(['data-variable'])
}

const SAFE_URL_PATTERN = /^(https?:\/\/|mailto:)/i

function sanitizeNode(node: Node): void {
  for (const child of Array.from(node.childNodes)) {
    if (child.nodeType === Node.TEXT_NODE) continue

    if (child.nodeType !== Node.ELEMENT_NODE) {
      child.remove()
      continue
    }

    const el = child as Element
    const tag = el.tagName.toLowerCase()

    if (!ALLOWED_TAGS.has(tag)) {
      // Unwrap: keep children, remove the disallowed tag
      while (el.firstChild) el.parentNode!.insertBefore(el.firstChild, el)
      el.remove()
      continue
    }

    // Strip disallowed attributes
    const allowed = ALLOWED_ATTRS[tag] ?? new Set<string>()
    for (const attr of Array.from(el.attributes)) {
      if (!allowed.has(attr.name)) {
        el.removeAttribute(attr.name)
      }
    }

    // Validate href — block javascript: and other dangerous protocols
    if (tag === 'a') {
      const href = el.getAttribute('href') ?? ''
      if (!SAFE_URL_PATTERN.test(href)) {
        el.removeAttribute('href')
      }
      el.setAttribute('target', '_blank')
      el.setAttribute('rel', 'noopener noreferrer')
    }

    sanitizeNode(el)
  }
}

/**
 * Sanitize HTML output from the rich-text editor for safe v-html rendering.
 *
 * Whitelists only tags/attributes that Tiptap produces:
 * - Tags: p, strong, em, u, a, span, br
 * - Attributes: href/target/rel on a, data-variable on span
 * - Validates URLs (only http/https/mailto)
 *
 * Returns the raw string on the server (no DOMParser available).
 *
 * @example
 * ```ts
 * const safe = sanitizeRichText(store.bodyText)
 * // Use with v-html="safe"
 * ```
 */
export function sanitizeRichText(html: string): string {
  if (!html) return ''
  if (typeof window === 'undefined') return html

  const doc = new DOMParser().parseFromString(html, 'text/html')
  sanitizeNode(doc.body)
  return doc.body.innerHTML
}

/**
 * Escape a string for safe insertion into HTML.
 * Use when interpolating dynamic values into sanitized HTML.
 */
export function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

/**
 * Replace template variables in rich-text HTML with escaped values.
 *
 * Handles both:
 * - `<span data-variable="KEY">{{ KEY }}</span>` (Tiptap variable nodes)
 * - `{{ KEY }}` plain text (backward compatibility)
 *
 * All replacement values are HTML-escaped to prevent injection.
 */
export function replaceRichTextVariables(html: string, variables: Record<string, string>): string {
  let result = html
  for (const [key, value] of Object.entries(variables)) {
    const escaped = escapeHtml(value)
    // Replace variable node spans
    result = result.replace(new RegExp(`<span data-variable="${key}">[^<]*</span>`, 'g'), escaped)
    // Replace plain {{ KEY }} text (backward compat)
    result = result.replace(new RegExp(`\\{\\{\\s*${key}\\s*\\}\\}`, 'g'), escaped)
  }
  return result
}
