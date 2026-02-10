/**
 * Certificate HTML fragment builder — single source of truth.
 *
 * Returns an HTML fragment with inline styles that renders identically in:
 * - Vue preview (via v-html)
 * - Puppeteer PDF (wrapped in a full HTML page)
 *
 * Dispatches to layout-specific builders based on the layout ID.
 */

import type { CertificateLayoutId } from '../types'
import type { CertificateTemplateTargets } from './sections'
import { LAYOUT_REGISTRY, getLayoutOrientation } from './layouts'

export interface CertificateFragmentData {
  title: string
  /** Pre-sanitized rich-text HTML with variables already replaced */
  subtitleHtml: string
  /** Pre-sanitized rich-text HTML with variables already replaced */
  bodyHtml: string
  pageBorderStyle: 'none' | 'border' | 'rounded' | 'double'
  pageBorderThickness: 'thin' | 'medium' | 'thick'
  layout: CertificateLayoutId
  showLogo: boolean
  logoSize: 'small' | 'medium' | 'large'
  showSignature: boolean
  signatureName: string
  signatureTitle: string
  signatureFontFamily: string
  backgroundImage: string | null
  showProduct: boolean
  productImageShape: 'circle' | 'rounded' | 'square'
  titleTextColor: string
  separatorsAndBordersColor: string
  showDate: boolean
  showDonorName: boolean
  donorNameFontFamily: string
  donorNamePosition: 'above-product' | 'below-product'
  footerText: string
  donorName?: string
  date?: string
  targets?: CertificateTemplateTargets
  branding: {
    logoUrl: string
    primaryColor: string
    secondaryColor: string
    fontFamily: string
  }
  product?: { name: string; image: string }
}

/**
 * Build certificate HTML fragment using the appropriate layout builder.
 */
export function buildCertificateFragment(data: CertificateFragmentData): string {
  const layoutDef = LAYOUT_REGISTRY[data.layout]
  if (!layoutDef) {
    // Fall back to portrait-classic if layout not found
    return LAYOUT_REGISTRY['portrait-classic'].builder(data)
  }
  return layoutDef.builder(data)
}

/**
 * Get the orientation for a given layout ID.
 * Used by preview and PDF generation to set correct aspect ratio / page size.
 */
export function getFragmentOrientation(layout: CertificateLayoutId): 'portrait' | 'landscape' {
  return getLayoutOrientation(layout)
}

// Re-export for backward compatibility
export { getLayoutOrientation }
