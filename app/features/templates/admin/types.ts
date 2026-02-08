/**
 * Template types for receipts, certificates, and eCards
 */

export interface ReceiptTemplate {
  headerText: string
  footerText: string
  showGiftAid: boolean
  showPaymentMethod: boolean
  showCampaignName: boolean
  showLogo: boolean
}

export interface CertificateTemplate {
  title: string
  subtitle: string
  bodyText: string
  borderStyle: 'classic' | 'modern' | 'minimal' | 'ornate'
  showLogo: boolean
  showDate: boolean
  showSignature: boolean
  signatureName: string
  signatureTitle: string
  orientation: 'portrait' | 'landscape'
  backgroundImage: string | null
}

export interface ECardTemplate {
  id: string
  name: string
  subject: string
  imageUrl: string
  bodyHtml: string
  category: 'thank-you' | 'tribute' | 'celebration' | 'custom'
  createdAt: string
}
