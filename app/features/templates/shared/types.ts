/**
 * Shared types for certificate rendering.
 * Used by both Vue preview components and PDF generation.
 */

import type { BackgroundType, CertificateLayoutId } from '~/features/templates/admin/types'

/** Branding information for certificate rendering */
export interface CertificateBranding {
  logoUrl: string
  charityName: string
  primaryColor: string
  secondaryColor: string
  fontFamily: string
}

/** Design settings for certificate appearance */
export interface CertificateDesign {
  pageBorderStyle: 'none' | 'border' | 'rounded' | 'double'
  pageBorderThickness: 'thin' | 'medium' | 'thick'
  backgroundType: BackgroundType
  backgroundImage: string | null
  separatorsAndBordersColor: string
}

/** Header section settings */
export interface CertificateHeader {
  showLogo: boolean
  logoSize: 'small' | 'medium' | 'large'
  logoPosition: 'center' | 'left'
  titleLine1: string
  titleLine2: string
  titleTextColor: string
}

/** Product display settings */
export interface CertificateProduct {
  name: string
  image: string
  show: boolean
  imageShape: 'circle' | 'rounded' | 'square'
  /** Text shown next to product image on certificates */
  text?: string
}

/** Donor name display settings (used within award block) */
export interface CertificateDonorName {
  value: string
  show: boolean
  fontFamily: string
}

/** Award block with 2 rows: text line 1, donor name */
export interface CertificateAwardBlock {
  textLine1: string
  donorName?: CertificateDonorName
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
 * All rich text (bodyHtml) should be pre-sanitized with variables replaced.
 */
export interface CertificateModel {
  layout: CertificateLayoutId
  branding: CertificateBranding
  design: CertificateDesign
  header: CertificateHeader
  /** Award block with 2 rows: text line 1, donor name (optional) */
  awardBlock?: CertificateAwardBlock
  /** Pre-sanitized rich-text HTML with variables replaced */
  bodyHtml: string
  product?: CertificateProduct
  date?: CertificateDate
  signature?: CertificateSignature
  footer?: CertificateFooterSettings
  /** Target paths for editable preview navigation */
  targets?: CertificateTemplateTargets
}

/** Target field paths for editable preview navigation */
export interface CertificateTemplateTargets {
  showLogo: string
  titleLine1: string
  titleLine2: string
  logo: string
  title: string
  award: string
  body: string
  product: string
  footer: string
  page: string
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
