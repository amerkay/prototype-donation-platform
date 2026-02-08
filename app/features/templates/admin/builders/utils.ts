/**
 * Shared utilities for template fragment builders.
 *
 * These run isomorphically — both in the Vue client (preview)
 * and on the server (PDF generation via Puppeteer).
 */

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
  .cert-body p { margin: 0; }
  .cert-body p + p { margin-top: 0.5em; }
  .cert-body a { color: inherit; text-decoration: underline; }
  .cert-body.clamp-landscape {
    display: -webkit-box;
    -webkit-line-clamp: 4;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }
  .cert-body.clamp-portrait {
    display: -webkit-box;
    -webkit-line-clamp: 6;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }
`
