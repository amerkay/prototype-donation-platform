/**
 * Certificate HTML fragment builder — single source of truth.
 *
 * Returns an HTML fragment with inline styles that renders identically in:
 * - Vue preview (via v-html)
 * - Puppeteer PDF (wrapped in a full HTML page)
 */

import { escapeHtml, CERT_BODY_CSS } from './utils'

type CertificateTemplateTargets = {
  showLogo: string
  title: string
  subtitle: string
  header: string
  body: string
  productSettings: string
  signatureSettings: string
  design: string
}

export interface CertificateFragmentData {
  title: string
  /** Pre-sanitized rich-text HTML with variables already replaced */
  subtitleHtml: string
  /** Pre-sanitized rich-text HTML with variables already replaced */
  bodyHtml: string
  bodyTextFontSize: 'small' | 'medium' | 'large'
  borderStyle: 'classic' | 'modern' | 'minimal' | 'ornate'
  orientation: 'portrait' | 'landscape'
  showLogo: boolean
  showSignature: boolean
  signatureName: string
  signatureTitle: string
  signatureFontFamily: string
  backgroundImage: string | null
  showProduct: boolean
  productBorderRadius: 'circle' | 'rounded' | 'square'
  titleColor: string
  separatorsAndBorders: string
  targets?: CertificateTemplateTargets
  branding: {
    logoUrl: string
    primaryColor: string
    secondaryColor: string
    fontFamily: string
  }
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

const BODY_TEXT_FONT_SIZES: Record<CertificateFragmentData['bodyTextFontSize'], string> = {
  small: '0.625rem',
  medium: '0.75rem',
  large: '0.875rem'
}

const FIXED_SIGNATURE_COLOR = '#333'
const SEPARATOR_WIDTH = '6rem'
const SEPARATOR_THICKNESS = '0.125rem'
const FIXED_PRODUCT_NAME_COLOR = '#111827'
const DEFAULT_TARGETS: CertificateTemplateTargets = {
  showLogo: 'showLogo',
  title: 'title',
  subtitle: 'subtitle',
  header: 'header',
  body: 'body',
  productSettings: 'productSettings',
  signatureSettings: 'signatureSettings',
  design: 'design'
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
  const targets = data.targets ?? DEFAULT_TARGETS
  const isLandscape = data.orientation === 'landscape'
  const hasBackground = !!data.backgroundImage
  const font = escapeHtml(branding.fontFamily || 'inherit')

  // Resolve all configurable colors
  const titleColor = resolveColor(data.titleColor, branding.primaryColor, branding.secondaryColor)
  const separatorsAndBordersColor = resolveColor(
    data.separatorsAndBorders,
    branding.primaryColor,
    branding.secondaryColor
  )
  const signatureFont = escapeHtml(data.signatureFontFamily || branding.fontFamily || 'inherit')

  const borderCss = !hasBackground ? (BORDER_STYLES[data.borderStyle] ?? '') : ''
  const borderColor = !hasBackground ? `border-color: ${separatorsAndBordersColor};` : ''
  const ringColor = !hasBackground ? `--ring-color: ${separatorsAndBordersColor};` : ''
  const contentPadding = isLandscape ? 'padding: 2rem 4rem;' : 'padding: 2rem 2.5rem;'
  const bodyClamp = isLandscape ? 'clamp-landscape' : 'clamp-portrait'
  const bodyFontSize = BODY_TEXT_FONT_SIZES[data.bodyTextFontSize] ?? BODY_TEXT_FONT_SIZES.medium

  const backgroundHtml = hasBackground
    ? `<img data-field="${targets.design}" src="${data.backgroundImage}" alt="" style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; object-fit: cover;" />`
    : `<div data-field="${targets.design}" style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; background: #fff;"></div>`

  const logoHtml =
    data.showLogo && branding.logoUrl
      ? `<img data-field="${targets.showLogo}" src="${branding.logoUrl}" alt="Logo" style="margin: 0 auto 0.75rem; height: 2.5rem; width: auto; flex-shrink: 0; object-fit: contain;" />`
      : data.showLogo
        ? `<div data-field="${targets.showLogo}" style="width: 3rem; height: 3rem; border-radius: 9999px; margin: 0 auto 0.75rem; display: flex; flex-shrink: 0; align-items: center; justify-content: center; color: #fff; font-size: 1.125rem; font-weight: 700; background-color: ${branding.primaryColor};">&#10022;</div>`
        : ''

  const imageSize = isLandscape ? '6rem' : '8rem'
  const productRadius =
    PRODUCT_BORDER_RADIUS[data.productBorderRadius] ?? PRODUCT_BORDER_RADIUS.circle
  const productHtml =
    data.showProduct && data.product
      ? `<div data-field="${targets.productSettings}" style="display: flex; flex-direction: column; align-items: center; margin-bottom: 0.75rem; flex-shrink: 0;">
        <img src="${data.product.image}" alt="${escapeHtml(data.product.name)}" style="width: ${imageSize}; height: ${imageSize}; border-radius: ${productRadius}; object-fit: cover; border: 3px solid ${separatorsAndBordersColor}; margin-bottom: 0.5rem;" />
        <p style="font-size: 1.125rem; font-weight: 700; line-height: 1.25; color: ${FIXED_PRODUCT_NAME_COLOR}; width: 100%; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;">${escapeHtml(data.product.name)}</p>
      </div>`
      : ''

  const signatureHtml = data.showSignature
    ? `<div data-field="${targets.signatureSettings}" style="margin-top: 0.5rem; width: 100%; flex-shrink: 0;">
        <div style="width: ${SEPARATOR_WIDTH}; height: ${SEPARATOR_THICKNESS}; margin: 0 auto 0.5rem; background-color: ${separatorsAndBordersColor};"></div>
        <p style="font-size: 1.125rem; font-weight: 500; font-family: '${signatureFont}', '${font}', sans-serif; color: ${FIXED_SIGNATURE_COLOR}; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; width: 100%; margin: 0 auto; text-align: center;">${escapeHtml(data.signatureName)}</p>
        <p style="font-size: 0.75rem; color: #333; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; width: 100%; margin: 0 auto; text-align: center;">${escapeHtml(data.signatureTitle)}</p>
      </div>`
    : ''

  return `<style>${CERT_BODY_CSS}</style>
<div data-field="${targets.design}" style="position: relative; width: 100%; height: 100%; overflow: hidden; font-family: ${font}; ${borderCss} ${borderColor} ${ringColor}">
  ${backgroundHtml}

  <div style="position: relative; z-index: 10; display: flex; flex-direction: column; align-items: center; height: 100%; text-align: center; overflow: hidden; ${contentPadding}">
    <div style="width: 100%; flex-shrink: 0;">
      ${logoHtml}
      <h2 data-field="${targets.title}" style="font-size: 1.5rem; font-weight: 700; line-height: 1.25em; letter-spacing: 0.025em; text-transform: uppercase; margin-bottom: 1rem; overflow: hidden; text-overflow: ellipsis; width: 100%; color: ${titleColor};">
        ${escapeHtml(data.title)}
      </h2>
      <div data-field="${targets.subtitle}" class="cert-subtitle clamp-subtitle" style="font-size: 0.75rem; color: #333; margin-bottom: 1rem; width: 100%;">
        ${data.subtitleHtml}
      </div>
    </div>

    <div style="width: 100%;">
      ${productHtml}
      <div data-field="${targets.design}" style="width: ${SEPARATOR_WIDTH}; height: ${SEPARATOR_THICKNESS}; margin: 0 auto 1rem; flex-shrink: 0; background-color: ${separatorsAndBordersColor};"></div>
      <div data-field="${targets.body}" class="cert-body ${bodyClamp}" style="font-size: ${bodyFontSize}; line-height: 1.625; margin-bottom: 0.75rem; color: #333; width: 100%; margin-left: auto; margin-right: auto;">
        ${data.bodyHtml}
      </div>
    </div>

    <div style="width: 100%; margin-top: auto; flex-shrink: 0;">
      ${signatureHtml}
    </div>
  </div>
</div>`
}
