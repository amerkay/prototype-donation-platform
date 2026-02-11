/**
 * HTML sanitizer for rich-text field output
 *
 * Uses isomorphic-dompurify for XSS protection with full SSR support.
 * Whitelists only tags/attributes that Tiptap produces.
 *
 * Safe for v-html rendering of rich-text field output.
 */

import DOMPurify from 'isomorphic-dompurify'

const ALLOWED_TAGS = ['p', 'strong', 'em', 'u', 'a', 'span', 'br']
const ALLOWED_ATTR = ['href', 'target', 'rel', 'data-variable']

// Enforce safe link attributes on all anchors
DOMPurify.addHook('afterSanitizeAttributes', (node) => {
  if (node.tagName === 'A') {
    node.setAttribute('target', '_blank')
    node.setAttribute('rel', 'noopener noreferrer')
  }
})

/**
 * Sanitize HTML output from the rich-text editor for safe v-html rendering.
 *
 * Whitelists only tags/attributes that Tiptap produces:
 * - Tags: p, strong, em, u, a, span, br
 * - Attributes: href/target/rel on a, data-variable on span
 *
 * Works on both client and server (isomorphic).
 *
 * @example
 * ```ts
 * const safe = sanitizeRichText(store.bodyText)
 * // Use with v-html="safe"
 * ```
 */
export function sanitizeRichText(html: string): string {
  if (!html) return ''
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS,
    ALLOWED_ATTR,
    ALLOW_DATA_ATTR: false
  })
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
    .replace(/'/g, '&#39;')
}
