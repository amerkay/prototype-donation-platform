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

/** Data contract for server-side certificate PDF generation */
export interface CertificatePdfData {
  title: string
  subtitle: string
  bodyHtml: string
  borderStyle: 'classic' | 'modern' | 'minimal' | 'ornate'
  showLogo: boolean
  showDate: boolean
  showSignature: boolean
  signatureName: string
  signatureTitle: string
  orientation: 'portrait' | 'landscape'
  backgroundImage: string | null
  branding: {
    logoUrl: string
    primaryColor: string
    fontFamily: string
  }
  donorName: string
  amount: string
  date: string
  product?: { name: string; image: string }
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
