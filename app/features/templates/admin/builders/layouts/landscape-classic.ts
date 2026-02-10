/**
 * Landscape Classic layout builder.
 *
 * Compact horizontal certificate with adaptive content:
 * - Header: Logo, title (1 line), subtitle (2 lines), optional donor name
 * - Content: Product image (adaptive height), optional donor name, body text
 * - Footer: Date/signature row, footer text (always at bottom)
 */

import { escapeHtml, CERT_BODY_CSS, ADAPTIVE_TEXT_SCRIPT } from '../utils'
import {
  getThickness,
  getDefaultTargets,
  getFormattedDate,
  resolveColor,
  getBorderCss,
  buildLogoSection,
  buildTitleSection,
  buildSubtitleSection,
  buildDonorNameSection,
  buildProductSection,
  buildBodySection,
  buildBottomRow,
  buildBackground,
  type SectionContext
} from '../sections'
import type { CertificateFragmentData } from '../certificate-fragment'

export function buildLandscapeClassic(data: CertificateFragmentData): string {
  const { branding } = data
  const targets = data.targets ?? getDefaultTargets()
  const font = escapeHtml(branding.fontFamily || 'inherit')
  const thickness = getThickness(data.pageBorderThickness)

  // Resolve colors
  const titleTextColor = resolveColor(
    data.titleTextColor,
    branding.primaryColor,
    branding.secondaryColor
  )
  const separatorsAndBordersColor = resolveColor(
    data.separatorsAndBordersColor,
    branding.primaryColor,
    branding.secondaryColor
  )

  // Build context for section builders (compact mode for landscape)
  const ctx: SectionContext = {
    targets,
    colors: { titleText: titleTextColor, separatorsAndBorders: separatorsAndBordersColor },
    thickness,
    branding: {
      logoUrl: branding.logoUrl,
      primaryColor: branding.primaryColor,
      fontFamily: branding.fontFamily
    },
    compact: true
  }

  // Build sections
  const backgroundHtml = buildBackground(targets.design, data.backgroundImage)
  const logoHtml = buildLogoSection(ctx, { showLogo: data.showLogo, logoSize: data.logoSize })
  const titleHtml = buildTitleSection(ctx, { title: data.title })
  const subtitleHtml = buildSubtitleSection(ctx, { subtitleHtml: data.subtitleHtml })

  const donorNameHtml = buildDonorNameSection(ctx, {
    donorName: data.donorName || 'John Smith',
    showDonorName: data.showDonorName,
    donorNameFontFamily: data.donorNameFontFamily
  })

  const productHtml = buildProductSection(ctx, {
    showProduct: data.showProduct,
    product: data.product,
    productImageShape: data.productImageShape,
    adaptive: true
  })

  const bodyHtml = buildBodySection(ctx, { bodyHtml: data.bodyHtml })

  const bottomRowHtml = buildBottomRow(ctx, {
    showDate: data.showDate,
    date: getFormattedDate(data.date),
    showSignature: data.showSignature,
    signatureName: data.signatureName,
    signatureTitle: data.signatureTitle,
    signatureFontFamily: data.signatureFontFamily,
    footerText: data.footerText
  })

  // Position donor name based on setting
  const donorAbove = data.donorNamePosition === 'above-product'
  const donorNameAboveHtml = donorAbove ? donorNameHtml : ''
  const donorNameBelowHtml = donorAbove ? '' : donorNameHtml

  // Build border CSS
  const borderCss = getBorderCss(data.pageBorderStyle, thickness, separatorsAndBordersColor, true)

  return `<style>${CERT_BODY_CSS}</style>
<div data-field="${targets.design}" style="position: relative; width: 100%; height: 100%; overflow: hidden; font-family: ${font}; ${borderCss}">
  ${backgroundHtml}
  <div style="position: relative; z-index: 10; display: flex; flex-direction: column; height: 100%; overflow: hidden; padding: 0.5rem 1.5rem 0.375rem;">
    <div style="text-align: center; flex-shrink: 0;">
      ${logoHtml}
      ${titleHtml}
      ${subtitleHtml}
      ${donorNameAboveHtml}
    </div>
    <div style="flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: flex-start; text-align: center; min-height: 0; overflow: hidden;">
      ${productHtml}
      ${donorNameBelowHtml}
      ${bodyHtml}
    </div>
    <div style="flex-shrink: 0;">
      ${bottomRowHtml}
    </div>
  </div>
</div>
${ADAPTIVE_TEXT_SCRIPT}`
}
