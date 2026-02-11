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
