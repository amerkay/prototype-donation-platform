/**
 * Certificate HTML fragment builder — single source of truth.
 *
 * Returns an HTML fragment with inline styles that renders identically in:
 * - Vue preview (via v-html)
 * - Puppeteer PDF (wrapped in a full HTML page)
 */

import { escapeHtml, CERT_BODY_CSS } from './utils'

export interface CertificateFragmentData {
  title: string
  subtitle: string
  /** Pre-sanitized rich-text HTML with variables already replaced */
  bodyHtml: string
  borderStyle: 'classic' | 'modern' | 'minimal' | 'ornate'
  orientation: 'portrait' | 'landscape'
  showLogo: boolean
  showDate: boolean
  showSignature: boolean
  signatureName: string
  signatureTitle: string
  backgroundImage: string | null
  branding: {
    logoUrl: string
    primaryColor: string
    fontFamily: string
  }
  date: string
  product?: { name: string; image: string }
}

const BORDER_STYLES: Record<string, string> = {
  classic: 'border: 4px double;',
  modern: 'border: 2px solid;',
  minimal: 'border: 1px solid;',
  ornate: 'border: 4px double; box-shadow: 0 0 0 4px #fff, 0 0 0 6px var(--ring-color);'
}

export function buildCertificateFragment(data: CertificateFragmentData): string {
  const { branding } = data
  const isLandscape = data.orientation === 'landscape'
  const hasBackground = !!data.backgroundImage
  const font = branding.fontFamily || 'inherit'

  const borderCss = !hasBackground ? (BORDER_STYLES[data.borderStyle] ?? '') : ''
  const borderColor = !hasBackground ? `border-color: ${branding.primaryColor};` : ''
  const ringColor = !hasBackground ? `--ring-color: ${branding.primaryColor};` : ''
  const contentPadding = isLandscape ? 'padding: 2rem 4rem;' : 'padding: 2rem 2.5rem;'
  const bodyClamp = isLandscape ? 'clamp-landscape' : 'clamp-portrait'
  const bodyMaxWidth = isLandscape ? 'max-width: 28rem;' : 'max-width: 24rem;'

  const backgroundHtml = hasBackground
    ? `<img src="${data.backgroundImage}" alt="" style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; object-fit: cover;" />`
    : '<div style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; background: #fff;"></div>'

  const logoHtml =
    data.showLogo && branding.logoUrl
      ? `<img src="${branding.logoUrl}" alt="Logo" style="margin-bottom: 0.75rem; height: 3rem; width: auto; flex-shrink: 0; object-fit: contain;" />`
      : data.showLogo
        ? `<div style="width: 3rem; height: 3rem; border-radius: 9999px; margin: 0 auto 0.75rem; display: flex; flex-shrink: 0; align-items: center; justify-content: center; color: #fff; font-size: 1.125rem; font-weight: 700; background-color: ${branding.primaryColor};">&#10022;</div>`
        : ''

  const imageSize = isLandscape ? '6rem' : '8rem'
  const productHtml = data.product
    ? `<div style="display: flex; flex-direction: column; align-items: center; margin-bottom: 0.75rem; flex-shrink: 0;">
        <img src="${data.product.image}" alt="${escapeHtml(data.product.name)}" style="width: ${imageSize}; height: ${imageSize}; border-radius: 9999px; object-fit: cover; border: 3px solid ${branding.primaryColor}; margin-bottom: 0.5rem;" />
        <p style="font-size: 1.125rem; font-weight: 700; color: ${branding.primaryColor};">${escapeHtml(data.product.name)}</p>
      </div>`
    : ''

  const dateHtml = data.showDate
    ? `<p style="font-size: 0.75rem; color: #9ca3af; margin-bottom: 0.5rem; flex-shrink: 0;">${escapeHtml(data.date)}</p>`
    : ''

  const signatureHtml = data.showSignature
    ? `<div style="margin-top: 0.5rem; width: 100%; flex-shrink: 0;">
        <div style="width: 6rem; height: 1px; margin: 0 auto 0.5rem; background-color: ${branding.primaryColor};"></div>
        <p style="font-size: 0.875rem; font-weight: 500; color: ${branding.primaryColor}; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; max-width: 12rem; margin: 0 auto; text-align: center;">${escapeHtml(data.signatureName)}</p>
        <p style="font-size: 0.75rem; color: #6b7280; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; max-width: 12rem; margin: 0 auto; text-align: center;">${escapeHtml(data.signatureTitle)}</p>
      </div>`
    : ''

  return `<style>${CERT_BODY_CSS}</style>
<div style="position: relative; width: 100%; height: 100%; overflow: hidden; font-family: ${font}; ${borderCss} ${borderColor} ${ringColor}">
  ${backgroundHtml}

  <div style="position: relative; z-index: 10; display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100%; text-align: center; overflow: hidden; ${contentPadding}">
    ${logoHtml}

    <h2 style="font-size: 1.25rem; font-weight: 700; letter-spacing: 0.025em; text-transform: uppercase; margin-bottom: 0.25rem; overflow: hidden; text-overflow: ellipsis; width: 100%; flex-shrink: 0; color: ${branding.primaryColor};">
      ${escapeHtml(data.title)}
    </h2>

    <p style="font-size: 0.75rem; color: #6b7280; margin-bottom: 1rem; width: 100%; flex-shrink: 0;">
      ${escapeHtml(data.subtitle)}
    </p>

    ${productHtml}

    <div style="width: 4rem; height: 0.125rem; margin: 0 auto 1rem; flex-shrink: 0; background-color: ${branding.primaryColor};"></div>

    <div class="cert-body ${bodyClamp}" style="font-size: 0.875rem; line-height: 1.625; margin-bottom: 0.75rem; color: #374151; flex-shrink: 0; ${bodyMaxWidth} margin-left: auto; margin-right: auto;">
      ${data.bodyHtml}
    </div>

    ${dateHtml}
    ${signatureHtml}
  </div>
</div>`
}
