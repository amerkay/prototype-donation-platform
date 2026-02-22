/**
 * HTML sanitizer for rich-text field output
 *
 * Uses isomorphic-dompurify for XSS protection with full SSR support.
 * Whitelists only tags/attributes that Tiptap produces.
 *
 * Safe for v-html rendering of rich-text field output.
 */

import DOMPurify from 'isomorphic-dompurify'

type SanitizeProfile = 'rich-text' | 'email'

const RICH_TEXT_ALLOWED_TAGS = ['p', 'strong', 'em', 'u', 'a', 'span', 'br']
const RICH_TEXT_ALLOWED_ATTR = ['href', 'target', 'rel', 'data-variable']

const EMAIL_ALLOWED_TAGS = [...RICH_TEXT_ALLOWED_TAGS, 'div', 'img']
const EMAIL_ALLOWED_ATTR = [...RICH_TEXT_ALLOWED_ATTR, 'style', 'src', 'alt', 'width', 'height']

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
export function sanitizeRichText(
  html: string,
  options?: {
    profile?: SanitizeProfile
  }
): string {
  if (!html) return ''
  const profile = options?.profile ?? 'rich-text'
  let result = DOMPurify.sanitize(html, {
    ALLOWED_TAGS: profile === 'email' ? EMAIL_ALLOWED_TAGS : RICH_TEXT_ALLOWED_TAGS,
    ALLOWED_ATTR: profile === 'email' ? EMAIL_ALLOWED_ATTR : RICH_TEXT_ALLOWED_ATTR,
    ALLOW_DATA_ATTR: false
  })

  // Convert empty paragraphs (from Tiptap double-enters) to visible line breaks
  result = result.replace(/<p>(\s|&nbsp;)*<\/p>/g, '<p><br></p>')

  return result
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
