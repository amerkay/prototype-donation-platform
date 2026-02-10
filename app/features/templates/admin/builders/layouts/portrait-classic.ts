/**
 * Portrait Classic layout builder.
 *
 * Traditional vertical certificate with adaptive content:
 * - Header: Logo, title (2 lines adaptive), subtitle (2 lines adaptive), optional donor name
 * - Content: Product image (adaptive height), optional donor name, body text
 * - Footer: Date/signature row, footer text (always pinned to bottom)
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
  buildSeparator,
  type SectionContext
} from '../sections'
import type { CertificateFragmentData } from '../certificate-fragment'

export function buildPortraitClassic(data: CertificateFragmentData): string {
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

  // Build context for section builders (non-compact mode for portrait)
  const ctx: SectionContext = {
    targets,
    colors: { titleText: titleTextColor, separatorsAndBorders: separatorsAndBordersColor },
    thickness,
    branding: {
      logoUrl: branding.logoUrl,
      primaryColor: branding.primaryColor,
      fontFamily: branding.fontFamily
    },
    compact: false
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

  const separatorHtml = buildSeparator(ctx)
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
  const borderCss = getBorderCss(data.pageBorderStyle, thickness, separatorsAndBordersColor, false)

  return `<style>${CERT_BODY_CSS}</style>
<div data-field="${targets.design}" style="position: relative; width: 100%; height: 100%; overflow: hidden; font-family: ${font}; ${borderCss}">
  ${backgroundHtml}
  <div style="position: relative; z-index: 10; display: flex; flex-direction: column; align-items: center; height: 100%; text-align: center; overflow: hidden; padding: 1.5rem 2.5rem;">
    <div style="width: 100%; flex-shrink: 0;">
      ${logoHtml}
      ${titleHtml}
      ${subtitleHtml}
      ${donorNameAboveHtml}
    </div>
    <div style="width: 100%; flex: 1; display: flex; flex-direction: column; align-items: center; min-height: 0; overflow: hidden;">
      ${productHtml}
      ${donorNameBelowHtml}
      ${separatorHtml}
      ${bodyHtml}
    </div>
    <div style="width: 100%; flex-shrink: 0; margin-top: auto;">
      ${bottomRowHtml}
    </div>
  </div>
</div>
${ADAPTIVE_TEXT_SCRIPT}`
}
