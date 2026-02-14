/**
 * Template types for receipts, certificates, and eCards
 */

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
}

export interface CertificateTemplate {
  id: string
  name: string
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
  'id' | 'name' | 'createdAt' | 'updatedAt'
>

export interface ECardTemplate {
  id: string
  name: string
  subject: string
  imageUrl: string
  bodyHtml: string
  category: 'thank-you' | 'tribute' | 'celebration' | 'custom'
  createdAt: string
}

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
  }
  donation: {
    receiptNumber: string
    date: string
    donorName: string
    amount: string
    campaign?: string
    paymentMethod?: string
  }
}
