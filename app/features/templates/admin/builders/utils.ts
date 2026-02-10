/**
 * Shared utilities for template fragment builders.
 *
 * These run isomorphically — both in the Vue client (preview)
 * and on the server (PDF generation via Puppeteer).
 */

import { ADAPTIVE_TEXT_SCRIPT } from './adaptive-text'

/** Escape a string for safe interpolation into HTML attributes/content. */
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
 * - `<span data-variable="KEY">…</span>` (Tiptap variable nodes)
 * - `{{ KEY }}` plain text (backward compatibility)
 */
export function replaceVariables(html: string, variables: Record<string, string>): string {
  let result = html
  for (const [key, value] of Object.entries(variables)) {
    const escaped = escapeHtml(value)
    result = result.replace(new RegExp(`<span data-variable="${key}">[^<]*</span>`, 'g'), escaped)
    result = result.replace(new RegExp(`\\{\\{\\s*${key}\\s*\\}\\}`, 'g'), escaped)
  }
  return result
}

/** Common thickness presets for borders, separators, and product images */
export const THICKNESS_PRESETS = {
  thin: { borderPx: 1, productPx: 1, separatorPx: '1px' },
  medium: { borderPx: 2, productPx: 3, separatorPx: '2px' },
  thick: { borderPx: 4, productPx: 5, separatorPx: '3px' }
} as const

export type ThicknessPreset = keyof typeof THICKNESS_PRESETS

/**
 * Embedded CSS for certificate body rich text.
 *
 * This is injected as a `<style>` block inside the fragment because
 * Tiptap-generated HTML contains `<p>`, `<a>`, `<strong>` tags that
 * we can't add inline styles to (user-generated content).
 *
 * Uses `.cert-body` prefix to avoid scope leaking in Vue context.
 */
export const CERT_BODY_CSS = /* css */ `
  .cert-subtitle p { margin: 0; }
  .cert-subtitle p + p { margin-top: 0.25em; }
  .cert-subtitle a { color: inherit; text-decoration: underline; }
  .cert-subtitle.clamp-subtitle {
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }
  .cert-body p { margin: 0; }
  .cert-body p + p { margin-top: 0.5em; }
  .cert-body a { color: inherit; text-decoration: underline; }
  .cert-body.clamp-landscape {
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }
  .cert-body.clamp-portrait {
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }
  .cert-adaptive {
    white-space: nowrap;
    overflow: visible;
  }
`

export { ADAPTIVE_TEXT_SCRIPT }
