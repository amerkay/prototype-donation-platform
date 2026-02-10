/**
 * Reusable section builders for certificate layouts.
 *
 * Each section is a pure function that returns an HTML string.
 * Sections are composed by layout builders to create complete certificates.
 */

import { escapeHtml, THICKNESS_PRESETS, type ThicknessPreset } from './utils'
import { isHexColor } from '~/lib/colors'

// ============================================================================
// TYPES
// ============================================================================

/** Target field paths for editable preview navigation */
export interface CertificateTemplateTargets {
  showLogo: string
  title: string
  subtitle: string
  header: string
  body: string
  productSettings: string
  signatureSettings: string
  design: string
  donorName: string
  date: string
  footer: string
}

/** Resolved colors for consistent styling across sections */
export interface ResolvedColors {
  titleText: string
  separatorsAndBorders: string
}

/** Resolved thickness values from preset */
export interface ResolvedThickness {
  borderPx: number
  productPx: number
  separatorPx: string
}

/** Context passed to all section builders */
export interface SectionContext {
  targets: CertificateTemplateTargets
  colors: ResolvedColors
  thickness: ResolvedThickness
  branding: {
    logoUrl: string
    primaryColor: string
    fontFamily: string
  }
  /** Layout mode affects sizing and spacing */
  compact?: boolean
}

// ============================================================================
// CONSTANTS
// ============================================================================

const DEFAULT_TARGETS: CertificateTemplateTargets = {
  showLogo: 'showLogo',
  title: 'title',
  subtitle: 'subtitle',
  header: 'header',
  body: 'body',
  productSettings: 'productSettings',
  signatureSettings: 'signatureSettings',
  design: 'design',
  donorName: 'donorName',
  date: 'date',
  footer: 'footer'
}

/** Logo size configuration - portrait uses larger sizes */
const LOGO_SIZES = {
  portrait: {
    small: { height: '2rem', fallbackSize: '2.5rem', margin: '0.5rem' },
    medium: { height: '2.5rem', fallbackSize: '3rem', margin: '0.75rem' },
    large: { height: '3.5rem', fallbackSize: '4rem', margin: '1rem' }
  },
  landscape: {
    small: { height: '1.25rem', fallbackSize: '1.5rem', margin: '0.125rem' },
    medium: { height: '2rem', fallbackSize: '2.25rem', margin: '0.125rem' },
    large: { height: '3rem', fallbackSize: '3.25rem', margin: '0.125rem' }
  }
} as const

const PRODUCT_BORDER_RADIUS: Record<string, string> = {
  circle: '9999px',
  rounded: '0.75rem',
  square: '0'
}

const BORDER_STYLES = {
  none: () => 'border: none;',
  border: (thickness: number) => `border: ${thickness}px solid;`,
  rounded: (thickness: number, compact: boolean) =>
    `border: ${thickness}px solid; border-radius: ${compact ? '0.75rem' : '1.25rem'};`,
  double: (thickness: number) => `border: ${thickness}px double;`
} as const

// ============================================================================
// UTILITIES
// ============================================================================

export function getThickness(preset: ThicknessPreset): ResolvedThickness {
  return THICKNESS_PRESETS[preset] ?? THICKNESS_PRESETS.medium
}

/** Resolve color value from preset name or hex color */
export function resolveColor(
  colorValue: string | undefined,
  brandingPrimary: string,
  brandingSecondary: string,
  fallback?: string
): string {
  const fb = fallback ?? brandingPrimary
  if (!colorValue || colorValue === '') return fb
  if (colorValue === 'primary') return brandingPrimary
  if (colorValue === 'secondary') return brandingSecondary
  if (!isHexColor(colorValue)) return fb
  return colorValue
}

/** Generate border CSS from style preset */
export function getBorderCss(
  style: string,
  thickness: ResolvedThickness,
  borderColor: string,
  compact: boolean
): string {
  if (style === 'none') return BORDER_STYLES.none()
  if (style === 'rounded') {
    return `${BORDER_STYLES.rounded(thickness.borderPx, compact)} border-color: ${borderColor};`
  }
  const styleFn = BORDER_STYLES[style as keyof typeof BORDER_STYLES] ?? BORDER_STYLES.border
  return `${styleFn(thickness.borderPx, false)} border-color: ${borderColor};`
}

/** Get default targets for layouts */
export function getDefaultTargets(): CertificateTemplateTargets {
  return { ...DEFAULT_TARGETS }
}

/** Get current date formatted for certificates */
export function getFormattedDate(date?: string): string {
  return (
    date ||
    new Date().toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    })
  )
}

// ============================================================================
// SECTION BUILDERS
// ============================================================================

export interface LogoSectionData {
  showLogo: boolean
  logoSize?: 'small' | 'medium' | 'large'
}

/** Organization logo or placeholder sparkle icon */
export function buildLogoSection(ctx: SectionContext, data: LogoSectionData): string {
  if (!data.showLogo) return ''

  const mode = ctx.compact ? 'landscape' : 'portrait'
  const sizes = LOGO_SIZES[mode]
  const sizeConfig = sizes[data.logoSize ?? 'medium'] || sizes.medium

  if (ctx.branding.logoUrl) {
    return `<img data-field="${ctx.targets.showLogo}" src="${ctx.branding.logoUrl}" alt="Logo" style="margin: 0 auto ${sizeConfig.margin}; height: ${sizeConfig.height}; width: auto; flex-shrink: 0; object-fit: contain;" />`
  }

  return `<div data-field="${ctx.targets.showLogo}" style="width: ${sizeConfig.fallbackSize}; height: ${sizeConfig.fallbackSize}; border-radius: 9999px; margin: 0 auto ${sizeConfig.margin}; display: flex; flex-shrink: 0; align-items: center; justify-content: center; color: #fff; font-size: ${ctx.compact ? '0.625rem' : '1.125rem'}; font-weight: 700; background-color: ${ctx.branding.primaryColor};">&#10022;</div>`
}

export interface TitleSectionData {
  title: string
}

/** Certificate title heading - adaptive, max 2 lines */
export function buildTitleSection(ctx: SectionContext, data: TitleSectionData): string {
  const fontSize = ctx.compact ? '1rem' : '1.5rem'
  const marginBottom = ctx.compact ? '0.125rem' : '0.75rem'
  const lineClamp = ctx.compact ? '1' : '2'

  return `<div style="width: 100%; overflow: hidden; margin-bottom: ${marginBottom};">
    <h2 data-field="${ctx.targets.title}" data-max-lines="${lineClamp}" style="font-size: ${fontSize}; font-weight: 700; line-height: 1.25; letter-spacing: 0.025em; color: ${ctx.colors.titleText}; margin: 0; display: -webkit-box; -webkit-line-clamp: ${lineClamp}; -webkit-box-orient: vertical; overflow: hidden;${ctx.compact ? ' font-style: italic;' : ''}">
      ${escapeHtml(data.title)}
    </h2>
  </div>`
}

export interface SubtitleSectionData {
  subtitleHtml: string
}

/** Rich text subtitle with variable support - adaptive, max 2 lines */
export function buildSubtitleSection(ctx: SectionContext, data: SubtitleSectionData): string {
  const fontSize = ctx.compact ? '0.5rem' : '0.75rem'
  const marginBottom = ctx.compact ? '0.25rem' : '0.75rem'

  return `<div data-field="${ctx.targets.subtitle}" class="cert-subtitle" style="font-size: ${fontSize}; color: #333; margin-bottom: ${marginBottom}; width: 100%; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;">
    ${data.subtitleHtml}
  </div>`
}

export interface DonorNameSectionData {
  donorName: string
  showDonorName: boolean
  donorNameFontFamily: string
}

/** Decorative donor name with script font */
export function buildDonorNameSection(ctx: SectionContext, data: DonorNameSectionData): string {
  if (!data.showDonorName) return ''

  const font = escapeHtml(data.donorNameFontFamily || ctx.branding.fontFamily || 'inherit')
  const fontSize = ctx.compact ? '0.75rem' : '1.5rem'
  const marginBottom = ctx.compact ? '0.125rem' : '0.75rem'

  return `<div style="width: 100%; overflow: hidden; margin-bottom: ${marginBottom};">
    <p data-field="${ctx.targets.donorName}" class="cert-adaptive" data-min-font="${ctx.compact ? '8' : '12'}" style="font-size: ${fontSize}; font-weight: 500; font-family: '${font}', serif; color: #333; margin: 0; text-align: center; white-space: nowrap;">
      ${escapeHtml(data.donorName)}
    </p>
  </div>`
}

export interface ProductSectionData {
  showProduct: boolean
  product?: { name: string; image: string }
  productImageShape: 'circle' | 'rounded' | 'square'
  /** If true, product fills available space (flex: 1) */
  adaptive?: boolean
}

/** Product image and name badge */
export function buildProductSection(ctx: SectionContext, data: ProductSectionData): string {
  if (!data.showProduct || !data.product) return ''

  const productRadius =
    PRODUCT_BORDER_RADIUS[data.productImageShape] ?? PRODUCT_BORDER_RADIUS.circle
  const nameFontSize = ctx.compact ? '0.5rem' : '1.125rem'

  if (data.adaptive) {
    // Adaptive mode: image fills available vertical space
    return `<div data-field="${ctx.targets.productSettings}" style="flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 0; max-height: 100%; margin-bottom: ${ctx.compact ? '0.25rem' : '0.5rem'};">
      <img src="${data.product.image}" alt="${escapeHtml(data.product.name)}" style="flex: 1; min-height: 0; max-height: 100%; aspect-ratio: 1; object-fit: cover; border-radius: ${productRadius}; border: ${ctx.thickness.productPx}px solid ${ctx.colors.separatorsAndBorders};" />
      <p style="font-size: ${nameFontSize}; font-weight: 700; line-height: 1.25; color: #111827; margin: ${ctx.compact ? '0.25rem' : '0.5rem'} 0 0; flex-shrink: 0; text-align: center;">${escapeHtml(data.product.name)}</p>
    </div>`
  }

  // Fixed size mode for portrait
  const imageSize = '8rem'
  return `<div data-field="${ctx.targets.productSettings}" style="flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 0;">
    <img src="${data.product.image}" alt="${escapeHtml(data.product.name)}" style="width: ${imageSize}; max-width: 100%; max-height: 100%; aspect-ratio: 1; object-fit: cover; border-radius: ${productRadius}; border: ${ctx.thickness.productPx}px solid ${ctx.colors.separatorsAndBorders}; margin-bottom: 0.5rem;" />
    <p style="font-size: ${nameFontSize}; font-weight: 700; line-height: 1.25; color: #111827; text-align: center; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;">${escapeHtml(data.product.name)}</p>
  </div>`
}

export interface BodySectionData {
  bodyHtml: string
}

/** Main body text - max 2 lines with clamp */
export function buildBodySection(ctx: SectionContext, data: BodySectionData): string {
  if (!data.bodyHtml) return ''

  const fontSize = ctx.compact ? '0.4375rem' : '0.75rem'
  const marginBottom = ctx.compact ? '0' : '0.75rem'

  return `<div data-field="${ctx.targets.body}" class="cert-body" style="font-size: ${fontSize}; line-height: 1.5; color: #333; width: 100%; max-width: 95%; margin: 0 auto ${marginBottom}; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; text-align: center;">
    ${data.bodyHtml}
  </div>`
}

export interface DateSectionData {
  date: string
  showDate: boolean
}

/** Date section with "Date" label */
export function buildDateSection(ctx: SectionContext, data: DateSectionData): string {
  if (!data.showDate) return ''

  const labelSize = ctx.compact ? '0.1875rem' : '0.625rem'
  const dateSize = ctx.compact ? '0.3125rem' : '0.75rem'

  return `<div data-field="${ctx.targets.date}" style="text-align: center;">
    <p style="font-size: ${labelSize}; color: #6b7280; text-transform: uppercase; letter-spacing: 0.05em; margin: 0 0 ${ctx.compact ? '0.0625rem' : '0.25rem'};">Date</p>
    <p style="font-size: ${dateSize}; color: #333; margin: 0; white-space: nowrap;">${escapeHtml(data.date)}</p>
  </div>`
}

export interface SignatureSectionData {
  showSignature: boolean
  signatureName: string
  signatureTitle: string
  signatureFontFamily: string
}

/** Signature section with name and title */
export function buildSignatureSection(ctx: SectionContext, data: SignatureSectionData): string {
  if (!data.showSignature) return ''

  const signatureFont = escapeHtml(data.signatureFontFamily || ctx.branding.fontFamily || 'inherit')
  const nameSize = ctx.compact ? '0.5625rem' : '1.125rem'
  const titleSize = ctx.compact ? '0.25rem' : '0.75rem'

  return `<div data-field="${ctx.targets.signatureSettings}" style="text-align: center; flex-shrink: 0;">
    <p style="font-size: ${nameSize}; font-weight: 500; font-family: '${signatureFont}', sans-serif; color: #333; margin: 0; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${escapeHtml(data.signatureName)}</p>
    <p style="font-size: ${titleSize}; color: #6b7280; margin: 0; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${escapeHtml(data.signatureTitle)}</p>
  </div>`
}

export interface FooterSectionData {
  footerText: string
}

/** Footer text (e.g., website URL) */
export function buildFooterSection(ctx: SectionContext, data: FooterSectionData): string {
  if (!data.footerText) return ''

  const fontSize = ctx.compact ? '0.375rem' : '0.5625rem'
  const marginTop = ctx.compact ? '0.125rem' : '0.5rem'

  return `<p data-field="${ctx.targets.footer}" style="font-size: ${fontSize}; color: #6b7280; text-align: center; margin: ${marginTop} 0 0; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; width: 100%;">
    ${escapeHtml(data.footerText)}
  </p>`
}

/** Horizontal separator line */
export function buildSeparator(ctx: SectionContext, width?: string): string {
  const w = width ?? (ctx.compact ? '3rem' : '6rem')
  const margin = ctx.compact ? '0.375rem auto 0.25rem' : '0 auto 1rem'

  return `<div style="width: ${w}; height: ${ctx.thickness.separatorPx}; margin: ${margin}; flex-shrink: 0; background-color: ${ctx.colors.separatorsAndBorders};"></div>`
}

// ============================================================================
// COMPOSITE BUILDERS
// ============================================================================

export interface BottomRowData {
  showDate: boolean
  date: string
  showSignature: boolean
  signatureName: string
  signatureTitle: string
  signatureFontFamily: string
  footerText: string
}

/** Build bottom row with date, signature, and footer */
export function buildBottomRow(ctx: SectionContext, data: BottomRowData): string {
  const hasDate = data.showDate
  const hasSignature = data.showSignature
  const hasFooter = !!data.footerText

  const dateHtml = buildDateSection(ctx, { date: data.date, showDate: data.showDate })
  const signatureHtml = buildSignatureSection(ctx, {
    showSignature: data.showSignature,
    signatureName: data.signatureName,
    signatureTitle: data.signatureTitle,
    signatureFontFamily: data.signatureFontFamily
  })
  const footerHtml = buildFooterSection(ctx, { footerText: data.footerText })

  // Separator above date/signature
  const separator =
    hasDate || hasSignature ? buildSeparator(ctx, ctx.compact ? '3rem' : '6rem') : ''

  let rowHtml = ''
  if (hasDate && hasSignature) {
    const gap = ctx.compact ? '0.5rem' : '1rem'
    rowHtml = `<div style="display: grid; grid-template-columns: 1fr 1fr; gap: ${gap}; width: 100%; align-items: end;">
      <div style="text-align: left;">${dateHtml}</div>
      <div style="text-align: right;">${signatureHtml}</div>
    </div>`
  } else if (hasDate) {
    rowHtml = dateHtml
  } else if (hasSignature) {
    rowHtml = signatureHtml
  }

  const footerRow = hasFooter ? footerHtml : ''

  return `${separator}${rowHtml}${footerRow}`
}

/** Build background layer (image or solid color) */
export function buildBackground(target: string, backgroundImage: string | null): string {
  if (backgroundImage) {
    return `<img data-field="${target}" src="${backgroundImage}" alt="" style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; object-fit: cover;" />`
  }
  return `<div data-field="${target}" style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; background: #fff;"></div>`
}
