import { sanitizeRichText, escapeHtml } from '~/features/_library/form-builder/utils/sanitize-html'

export function sanitizeTemplateRichText(html: string): string {
  if (!html) return ''
  return sanitizeRichText(html)
}

/**
 * Replace template variables in rich-text HTML with escaped values.
 *
 * Handles both:
 * - `<span data-variable="KEY">…</span>` (Tiptap variable nodes)
 * - `{{ KEY }}` plain text (backward compatibility)
 */
function escapeRegExp(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

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
