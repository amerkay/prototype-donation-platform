/**
 * Shared types for certificate rendering.
 * Used by both Vue preview components and PDF generation.
 */

import type { CertificateLayoutId } from '~/features/templates/admin/types'

/** Branding information for certificate rendering */
export interface CertificateBranding {
  logoUrl: string
  primaryColor: string
  secondaryColor: string
  fontFamily: string
}

/** Design settings for certificate appearance */
export interface CertificateDesign {
  pageBorderStyle: 'none' | 'border' | 'rounded' | 'double'
  pageBorderThickness: 'thin' | 'medium' | 'thick'
  backgroundImage: string | null
  separatorsAndBordersColor: string
}

/** Header section settings */
export interface CertificateHeader {
  showLogo: boolean
  logoSize: 'small' | 'medium' | 'large'
  title: string
  titleTextColor: string
}

/** Product display settings */
export interface CertificateProduct {
  name: string
  image: string
  show: boolean
  imageShape: 'circle' | 'rounded' | 'square'
}

/** Donor name display settings */
export interface CertificateDonorName {
  value: string
  show: boolean
  fontFamily: string
  position: 'above-product' | 'below-product'
}

/** Date display settings */
export interface CertificateDate {
  value: string
  show: boolean
}

/** Signature display settings */
export interface CertificateSignature {
  show: boolean
  name: string
  title: string
  fontFamily: string
}

/** Footer settings */
export interface CertificateFooterSettings {
  text: string
}

/**
 * Complete certificate model for rendering.
 * All rich text (subtitleHtml, bodyHtml) should be pre-sanitized with variables replaced.
 */
export interface CertificateModel {
  layout: CertificateLayoutId
  branding: CertificateBranding
  design: CertificateDesign
  header: CertificateHeader
  /** Pre-sanitized rich-text HTML with variables replaced */
  subtitleHtml: string
  /** Pre-sanitized rich-text HTML with variables replaced */
  bodyHtml: string
  product?: CertificateProduct
  donorName?: CertificateDonorName
  date?: CertificateDate
  signature?: CertificateSignature
  footer?: CertificateFooterSettings
  /** Target paths for editable preview navigation */
  targets?: CertificateTemplateTargets
}

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

/** Common thickness presets for borders, separators, and product images */
export const THICKNESS_PRESETS = {
  thin: { borderPx: 2, productPx: 2, separatorPx: '2px' },
  medium: { borderPx: 4, productPx: 4, separatorPx: '3px' },
  thick: { borderPx: 6, productPx: 6, separatorPx: '4px' }
} as const

export type ThicknessPreset = keyof typeof THICKNESS_PRESETS

/** Get resolved thickness from preset name */
export function getThickness(preset: ThicknessPreset): ResolvedThickness {
  return THICKNESS_PRESETS[preset] ?? THICKNESS_PRESETS.medium
}

/** Logo size configuration for portrait and landscape modes */
export const LOGO_SIZES = {
  portrait: {
    small: { height: '3rem', fallbackSize: '3.5rem', margin: '1rem' },
    medium: { height: '4rem', fallbackSize: '4.5rem', margin: '1.5rem' },
    large: { height: '5.5rem', fallbackSize: '6rem', margin: '2rem' }
  },
  landscape: {
    small: { height: '3rem', fallbackSize: '3.5rem', margin: '1rem' },
    medium: { height: '4rem', fallbackSize: '4.5rem', margin: '1.5rem' },
    large: { height: '5.5rem', fallbackSize: '6rem', margin: '2rem' }
  }
} as const

/** Product image border radius by shape */
export const PRODUCT_BORDER_RADIUS: Record<string, string> = {
  circle: '9999px',
  rounded: '0.75rem',
  square: '0'
}

/** Border style CSS generators */
export const BORDER_STYLES = {
  none: () => 'none',
  border: (thickness: number) => `${thickness}px solid`,
  rounded: (thickness: number) => `${thickness}px solid`,
  double: (thickness: number) => `${thickness}px double`
} as const

// ============================================================================
// Receipt Types
// ============================================================================

/** Branding information for receipt rendering */
export interface ReceiptBranding {
  logoUrl: string
  primaryColor: string
}

/** Charity information for receipt rendering */
export interface ReceiptCharity {
  name: string
  registrationNumber: string
  address: string
}

/** Donation details for receipt rendering */
export interface ReceiptDonation {
  receiptNumber: string
  date: string
  donorName: string
  amount: string
  campaign?: string
  paymentMethod?: string
}

/**
 * Complete receipt model for rendering.
 * Used by both Vue preview components and PDF generation.
 */
export interface ReceiptModel {
  headerText: string
  footerText: string
  showGiftAid: boolean
  showPaymentMethod: boolean
  showCampaignName: boolean
  showLogo: boolean
  branding: ReceiptBranding
  charity: ReceiptCharity
  donation: ReceiptDonation
}
