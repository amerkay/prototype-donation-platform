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
  showProduct: boolean
  productBorderRadius: 'circle' | 'rounded' | 'square'
  productBorderColor: string
  productNameColor: string
  titleColor: string
  signatureColor: string
  branding: {
    logoUrl: string
    primaryColor: string
    secondaryColor: string
    fontFamily: string
  }
  date: string
  product?: { name: string; image: string }
}

const PRODUCT_BORDER_RADIUS: Record<string, string> = {
  circle: '9999px',
  rounded: '0.75rem',
  square: '0'
}

const BORDER_STYLES: Record<string, string> = {
  classic: 'border: 4px double;',
  modern: 'border: 2px solid;',
  minimal: 'border: 1px solid;',
  ornate: 'border: 4px double; box-shadow: 0 0 0 4px #fff, 0 0 0 6px var(--ring-color);'
}

/**
 * Resolve color preset to actual hex color.
 * @param colorValue - 'primary' | 'secondary' | '#RRGGBB' | '' | undefined
 * @param brandingPrimary - Branding primary color
 * @param brandingSecondary - Branding secondary color
 * @param fallback - Fallback color (default: brandingPrimary)
 */
function resolveColor(
  colorValue: string | undefined,
  brandingPrimary: string,
  brandingSecondary: string,
  fallback?: string
): string {
  const fb = fallback ?? brandingPrimary
  if (!colorValue || colorValue === '') return fb
  if (colorValue === 'primary') return brandingPrimary
  if (colorValue === 'secondary') return brandingSecondary
  return colorValue
}

export function buildCertificateFragment(data: CertificateFragmentData): string {
  const { branding } = data
  const isLandscape = data.orientation === 'landscape'
  const hasBackground = !!data.backgroundImage
  const font = branding.fontFamily || 'inherit'

  // Resolve all configurable colors
  const titleColor = resolveColor(data.titleColor, branding.primaryColor, branding.secondaryColor)
  const productBorderColor = resolveColor(
    data.productBorderColor,
    branding.primaryColor,
    branding.secondaryColor
  )
  const productNameColor = resolveColor(
    data.productNameColor,
    branding.primaryColor,
    branding.secondaryColor
  )
  const signatureColor = resolveColor(
    data.signatureColor,
    branding.primaryColor,
    branding.secondaryColor
  )

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
      ? `<img data-field="showLogo" src="${branding.logoUrl}" alt="Logo" style="margin-bottom: 0.75rem; height: 3rem; width: auto; flex-shrink: 0; object-fit: contain;" />`
      : data.showLogo
        ? `<div data-field="showLogo" style="width: 3rem; height: 3rem; border-radius: 9999px; margin: 0 auto 0.75rem; display: flex; flex-shrink: 0; align-items: center; justify-content: center; color: #fff; font-size: 1.125rem; font-weight: 700; background-color: ${branding.primaryColor};">&#10022;</div>`
        : ''

  const imageSize = isLandscape ? '6rem' : '8rem'
  const productRadius =
    PRODUCT_BORDER_RADIUS[data.productBorderRadius] ?? PRODUCT_BORDER_RADIUS.circle
  const productHtml =
    data.showProduct && data.product
      ? `<div data-field="showProduct" style="display: flex; flex-direction: column; align-items: center; margin-bottom: 0.75rem; flex-shrink: 0;">
        <img src="${data.product.image}" alt="${escapeHtml(data.product.name)}" style="width: ${imageSize}; height: ${imageSize}; border-radius: ${productRadius}; object-fit: cover; border: 3px solid ${productBorderColor}; margin-bottom: 0.5rem;" />
        <p style="font-size: 1.125rem; font-weight: 700; color: ${productNameColor};">${escapeHtml(data.product.name)}</p>
      </div>`
      : ''

  const dateHtml = data.showDate
    ? `<p data-field="showDate" style="font-size: 0.75rem; color: #9ca3af; margin-bottom: 0.5rem; flex-shrink: 0;">${escapeHtml(data.date)}</p>`
    : ''

  const signatureHtml = data.showSignature
    ? `<div data-field="showSignature" style="margin-top: 0.5rem; width: 100%; flex-shrink: 0;">
        <div style="width: 6rem; height: 1px; margin: 0 auto 0.5rem; background-color: ${signatureColor};"></div>
        <p style="font-size: 0.875rem; font-weight: 500; color: ${signatureColor}; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; max-width: 12rem; margin: 0 auto; text-align: center;">${escapeHtml(data.signatureName)}</p>
        <p style="font-size: 0.75rem; color: #6b7280; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; max-width: 12rem; margin: 0 auto; text-align: center;">${escapeHtml(data.signatureTitle)}</p>
      </div>`
    : ''

  return `<style>${CERT_BODY_CSS}</style>
<div style="position: relative; width: 100%; height: 100%; overflow: hidden; font-family: ${font}; ${borderCss} ${borderColor} ${ringColor}">
  ${backgroundHtml}

  <div style="position: relative; z-index: 10; display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100%; text-align: center; overflow: hidden; ${contentPadding}">
    ${logoHtml}

    <h2 data-field="title" style="font-size: 1.25rem; font-weight: 700; letter-spacing: 0.025em; text-transform: uppercase; margin-bottom: 0.25rem; overflow: hidden; text-overflow: ellipsis; width: 100%; flex-shrink: 0; color: ${titleColor};">
      ${escapeHtml(data.title)}
    </h2>

    <p data-field="subtitle" style="font-size: 0.75rem; color: #6b7280; margin-bottom: 1rem; width: 100%; flex-shrink: 0;">
      ${escapeHtml(data.subtitle)}
    </p>

    ${productHtml}

    <div style="width: 4rem; height: 0.125rem; margin: 0 auto 1rem; flex-shrink: 0; background-color: ${branding.primaryColor};"></div>

    <div data-field="bodyText" class="cert-body ${bodyClamp}" style="font-size: 0.875rem; line-height: 1.625; margin-bottom: 0.75rem; color: #374151; flex-shrink: 0; ${bodyMaxWidth} margin-left: auto; margin-right: auto;">
      ${data.bodyHtml}
    </div>

    ${dateHtml}
    ${signatureHtml}
  </div>
</div>`
}
