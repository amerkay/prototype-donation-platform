// Only import sanitizer on client - jsdom causes ESM issues in serverless
// The print page sanitizes before rendering, so server can skip
import type { sanitizeRichText as SanitizeRichTextFn } from '~/features/_library/form-builder/utils/sanitize-html'

let _sanitize: typeof SanitizeRichTextFn | undefined

if (import.meta.client) {
  import('~/features/_library/form-builder/utils/sanitize-html').then((mod) => {
    _sanitize = mod.sanitizeRichText
  })
}

/**
 * Escape a string for safe insertion into HTML.
 */
export function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

/**
 * Sanitize rich-text HTML. Skips on server to avoid jsdom ESM issues
 * in serverless environments. Server callers (PDF API) pass through
 * unsanitized - the print page sanitizes before rendering.
 */
export function sanitizeTemplateRichText(html: string): string {
  if (!html) return ''
  // Skip sanitization on server - print page handles it
  if (import.meta.server || !_sanitize) return html
  return _sanitize(html)
}

function escapeRegExp(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

/**
 * Replace template variables in rich-text HTML with escaped values.
 *
 * Handles both:
 * - `<span data-variable="KEY">…</span>` (Tiptap variable nodes)
 * - `{{ KEY }}` plain text (backward compatibility)
 */
function replaceVariables(html: string, variables: Record<string, string>): string {
  let result = html
  for (const [key, value] of Object.entries(variables)) {
    const escaped = escapeHtml(value)
    const safeKey = escapeRegExp(key)
    result = result.replace(
      new RegExp(`<span data-variable="${safeKey}">[^<]*</span>`, 'g'),
      escaped
    )
    result = result.replace(new RegExp(`\\{\\{\\s*${safeKey}\\s*\\}\\}`, 'g'), escaped)
  }
  return result
}

export function processTemplateRichText(html: string, variables: Record<string, string>): string {
  return replaceVariables(sanitizeTemplateRichText(html), variables)
}
