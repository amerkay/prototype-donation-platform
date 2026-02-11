import { sanitizeRichText, escapeHtml } from '~/features/_library/form-builder/utils/sanitize-html'

const ALLOWED_TAGS = new Set(['p', 'strong', 'em', 'u', 'a', 'span', 'br'])
const SAFE_URL_PATTERN = /^(https?:\/\/|mailto:)/i

function sanitizeServerRichText(html: string): string {
  return html.replace(/<\/?([a-z0-9-]+)([^>]*)>/gi, (full, rawTag, rawAttrs) => {
    const isClosing = full.startsWith('</')
    const tag = String(rawTag).toLowerCase()

    if (!ALLOWED_TAGS.has(tag)) return ''
    if (isClosing) return `</${tag}>`
    if (tag === 'br') return '<br>'

    if (tag === 'a') {
      const hrefMatch = String(rawAttrs).match(/\shref\s*=\s*(['"])(.*?)\1/i)
      const href = hrefMatch?.[2] ?? ''
      if (!SAFE_URL_PATTERN.test(href)) {
        return '<a target="_blank" rel="noopener noreferrer">'
      }
      return `<a href="${href}" target="_blank" rel="noopener noreferrer">`
    }

    if (tag === 'span') {
      const dataVarMatch = String(rawAttrs).match(/\sdata-variable\s*=\s*(['"])(.*?)\1/i)
      const dataVariable = dataVarMatch?.[2] ?? ''
      if (!dataVariable) return '<span>'
      return `<span data-variable="${dataVariable}">`
    }

    return `<${tag}>`
  })
}

export function sanitizeTemplateRichText(html: string): string {
  if (!html) return ''
  const sanitized = sanitizeRichText(html)

  if (typeof window !== 'undefined') return sanitized
  return sanitizeServerRichText(sanitized)
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
    result = result.replace(new RegExp(`<span data-variable="${key}">[^<]*</span>`, 'g'), escaped)
    result = result.replace(new RegExp(`\\{\\{\\s*${key}\\s*\\}\\}`, 'g'), escaped)
  }
  return result
}

export function processTemplateRichText(html: string, variables: Record<string, string>): string {
  return replaceVariables(sanitizeTemplateRichText(html), variables)
}
