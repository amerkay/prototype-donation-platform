/**
 * Template types for receipts, certificates, and email templates.
 * Runtime constants (EMAIL_TEMPLATE_META, etc.) live in ./email-templates.ts.
 */

import type { RichTextVariable } from '~/features/_library/form-builder/types'

/** Background type for certificates */
export type BackgroundType = 'white' | 'image'

/** Available certificate layout identifiers */
export type CertificateLayoutId = 'portrait-classic' | 'landscape-classic'

/** Metadata describing a certificate layout for UI display */
export interface CertificateLayoutMetadata {
  id: CertificateLayoutId
  name: string
  description: string
  orientation: 'portrait' | 'landscape'
}

export interface ReceiptTemplate {
  headerText: string
  footerText: string
  showGiftAid: boolean
  showPaymentMethod: boolean
  showCampaignName: boolean
  showLogo: boolean
  taxDeductibleStatement: string
  showDonorAddress: boolean
  showPhone: boolean
  showEmail: boolean
  showWebsite: boolean
}

/** Certificate template status */
export type CertificateTemplateStatus = 'active' | 'archived'

export interface CertificateTemplate {
  id: string
  name: string
  status: CertificateTemplateStatus
  createdAt: string
  updatedAt: string
  titleLine1: string
  titleLine2: string
  logoPosition: 'center' | 'left'
  awardTextLine1: string
  bodyText: string
  pageBorderStyle: 'none' | 'border' | 'rounded' | 'double'
  pageBorderThickness: 'thin' | 'medium' | 'thick'
  showLogo: boolean
  logoSize: 'small' | 'medium' | 'large'
  showSignature: boolean
  signatureName: string
  signatureTitle: string
  signatureFontFamily: string
  layout: CertificateLayoutId
  backgroundType: BackgroundType
  backgroundImage: string | null
  showProduct: boolean
  productImageShape: 'circle' | 'rounded' | 'square'
  titleTextColor: string
  separatorsAndBordersColor: string
  showDate: boolean
  showAwardSection: boolean
  donorNameFontFamily: string
  footerText: string
}

/** Certificate design settings (CertificateTemplate without identity/metadata fields) */
export type CertificateTemplateSettings = Omit<
  CertificateTemplate,
  'id' | 'name' | 'status' | 'createdAt' | 'updatedAt'
>

// ============================================================================
// EMAIL TEMPLATES
// ============================================================================

/** All 12 system email template type keys */
export type EmailTemplateType =
  | 'ecard-gift'
  | 'ecard-in-memory'
  | 'donor-donation-success'
  | 'donor-new-subscription'
  | 'donor-subscription-paused'
  | 'donor-subscription-resumed'
  | 'donor-subscription-cancelled'
  | 'donor-payment-failed'
  | 'admin-new-donation'
  | 'admin-new-p2p-fundraiser'
  | 'p2p-new-donation'
  | 'team-invitation'

/** Email template categories for filtering */
export type EmailTemplateCategory = 'ecard' | 'donor' | 'admin' | 'p2p' | 'team'

/** Metadata for each email template type */
export interface EmailTemplateMeta {
  displayName: string
  category: EmailTemplateCategory
  hasImage: boolean
  variables: ReadonlyArray<RichTextVariable>
}

/** System email template */
export interface EmailTemplate {
  id: string
  name: string
  type: EmailTemplateType
  subject: string
  bodyHtml: string
  imageUrl: string
  createdAt: string
  updatedAt: string
}

/** Email template settings (editable fields only) */
export type EmailTemplateSettings = Omit<
  EmailTemplate,
  'id' | 'name' | 'type' | 'createdAt' | 'updatedAt'
>

// ============================================================================
// PDF DATA CONTRACTS
// ============================================================================

/** Data contract for server-side certificate PDF generation */
export interface CertificatePdfData {
  titleLine1: string
  titleLine2: string
  logoPosition: 'center' | 'left'
  awardTextLine1: string
  bodyHtml: string
  pageBorderStyle: 'none' | 'border' | 'rounded' | 'double'
  pageBorderThickness: 'thin' | 'medium' | 'thick'
  showLogo: boolean
  logoSize: 'small' | 'medium' | 'large'
  showSignature: boolean
  signatureName: string
  signatureTitle: string
  signatureFontFamily: string
  layout: CertificateLayoutId
  backgroundType: BackgroundType
  backgroundImage: string | null
  showProduct: boolean
  productImageShape: 'circle' | 'rounded' | 'square'
  titleTextColor: string
  separatorsAndBordersColor: string
  showDate: boolean
  showAwardSection: boolean
  donorNameFontFamily: string
  footerText: string
  branding: {
    logoUrl: string
    charityName: string
    primaryColor: string
    secondaryColor: string
    fontFamily: string
  }
  donorName: string
  amount: string
  date: string
  product?: { name: string; image: string; text?: string }
}

/** Data contract for server-side receipt PDF generation */
export interface ReceiptPdfData {
  headerText: string
  footerText: string
  showGiftAid: boolean
  showPaymentMethod: boolean
  showCampaignName: boolean
  showLogo: boolean
  branding: {
    logoUrl: string
    primaryColor: string
  }
  charity: {
    name: string
    registrationNumber: string
    address: string
    phone?: string
    email?: string
    website?: string
  }
  taxDeductibleStatement: string
  showDonorAddress: boolean
  showPhone: boolean
  showEmail: boolean
  showWebsite: boolean
  donation: {
    receiptNumber: string
    date: string
    donorName: string
    donorAddress?: string
    amount: string
    currency: string
    campaign?: string
    paymentMethod?: string
  }
}
