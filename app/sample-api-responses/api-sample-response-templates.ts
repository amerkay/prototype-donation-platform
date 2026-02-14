import type {
  ReceiptTemplate,
  CertificateTemplate,
  ECardTemplate
} from '~/features/templates/admin/types'

export const receiptTemplate: ReceiptTemplate = {
  headerText: 'Thank you for your generous donation',
  footerText: 'This receipt is issued for tax purposes. Please retain for your records.',
  showGiftAid: true,
  showPaymentMethod: true,
  showCampaignName: true,
  showLogo: true
}

export const certificateTemplates: CertificateTemplate[] = [
  {
    id: 'cert-adoption',
    name: 'Adoption Certificate',
    status: 'active',
    createdAt: '2025-09-15T10:00:00Z',
    updatedAt: '2026-01-20T14:30:00Z',
    titleLine1: 'Certificate of',
    titleLine2: 'Adoption',
    logoPosition: 'center',
    awardTextLine1: 'This certificate is awarded to',
    bodyText:
      'Thank you for helping us save Bornean Orangutans from extinction! Your support provides food, medical care, and safe habitat.',
    pageBorderStyle: 'border',
    pageBorderThickness: 'thick',
    showLogo: true,
    logoSize: 'large',
    showSignature: true,
    signatureName: 'Jane Smith',
    signatureTitle: 'Executive Director',
    signatureFontFamily: 'Alex Brush',
    layout: 'portrait-classic',
    backgroundType: 'white',
    backgroundImage: null,
    showProduct: true,
    productImageShape: 'circle',
    titleTextColor: 'primary',
    separatorsAndBordersColor: 'secondary',
    showDate: true,
    showAwardSection: true,
    donorNameFontFamily: 'Pacifico',
    footerText: 'www.orangutan.org | Tax ID: 12-3456789'
  },
  {
    id: 'cert-donation',
    name: 'Donation Certificate',
    status: 'active',
    createdAt: '2025-11-01T09:00:00Z',
    updatedAt: '2026-01-18T11:00:00Z',
    titleLine1: 'Certificate of',
    titleLine2: 'Donation',
    logoPosition: 'center',
    awardTextLine1: 'This certificate is presented to',
    bodyText:
      'Your generous contribution helps protect endangered wildlife and preserve critical rainforest habitats for future generations.',
    pageBorderStyle: 'rounded',
    pageBorderThickness: 'medium',
    showLogo: true,
    logoSize: 'medium',
    showSignature: true,
    signatureName: 'Jane Smith',
    signatureTitle: 'Executive Director',
    signatureFontFamily: 'Alex Brush',
    layout: 'landscape-classic',
    backgroundType: 'white',
    backgroundImage: null,
    showProduct: false,
    productImageShape: 'circle',
    titleTextColor: 'primary',
    separatorsAndBordersColor: 'primary',
    showDate: true,
    showAwardSection: true,
    donorNameFontFamily: 'Pacifico',
    footerText: 'www.orangutan.org | Tax ID: 12-3456789'
  }
]

/** @deprecated Use certificateTemplates array instead */
export const certificateTemplate: CertificateTemplate = certificateTemplates[0]!

export const ecardTemplates: ECardTemplate[] = [
  {
    id: 'ecard-1',
    name: 'Thank You',
    subject: 'Thank you for your donation, {{ FIRST_NAME }}!',
    imageUrl: 'https://placehold.co/600x300/2563eb/ffffff?text=Thank+You',
    bodyHtml:
      '<p>Dear {{ FIRST_NAME }},</p><p>Thank you for your generous gift of {{ AMOUNT }}. Your support makes a real difference.</p><p>With gratitude,<br/>The Team</p>',
    category: 'thank-you',

    createdAt: '2025-01-15T10:00:00Z'
  },
  {
    id: 'ecard-2',
    name: 'In Memory Tribute',
    subject: 'A donation has been made in memory of {{ HONOREE_NAME }}',
    imageUrl: 'https://placehold.co/600x300/6b7280/ffffff?text=In+Memory',
    bodyHtml:
      '<p>Dear {{ FIRST_NAME }},</p><p>A gift of {{ AMOUNT }} has been made in memory of {{ HONOREE_NAME }} by {{ DONOR_NAME }}.</p><p>Their memory lives on through this act of kindness.</p>',
    category: 'tribute',

    createdAt: '2025-02-01T10:00:00Z'
  },
  {
    id: 'ecard-3',
    name: 'Birthday Celebration',
    subject: 'Happy Birthday, {{ FIRST_NAME }}! A gift was made in your honor',
    imageUrl: 'https://placehold.co/600x300/f59e0b/ffffff?text=Happy+Birthday',
    bodyHtml:
      '<p>Dear {{ FIRST_NAME }},</p><p>To celebrate your birthday, {{ DONOR_NAME }} has made a donation of {{ AMOUNT }} in your honor.</p><p>Wishing you a wonderful day!</p>',
    category: 'celebration',

    createdAt: '2025-03-10T10:00:00Z'
  }
]
