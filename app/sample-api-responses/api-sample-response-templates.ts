import type {
  ReceiptTemplate,
  CertificateTemplate,
  EmailTemplate
} from '~/features/templates/admin/types'

export const receiptTemplate: ReceiptTemplate = {
  headerText: 'Thank you for your generous donation',
  footerText: 'This receipt is issued for tax purposes. Please retain for your records.',
  showGiftAid: true,
  showPaymentMethod: true,
  showCampaignName: true,
  showLogo: true,
  taxDeductibleStatement:
    '<p>No goods or services were provided in exchange for this contribution.</p>',
  showDonorAddress: false,
  showPhone: true,
  showEmail: true,
  showWebsite: true
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

export const emailTemplates: EmailTemplate[] = [
  {
    id: 'email-ecard-gift',
    name: 'eCard: Gift',
    type: 'ecard-gift',
    subject: 'A thoughtful gift was made in your honor, {{ FIRST_NAME }}',
    bodyHtml:
      '<p>Dear {{ FIRST_NAME }},</p><p>{{ DONOR_NAME }} made a gift of {{ AMOUNT }} in your honor on {{ DATE }}.</p><p>We are grateful to celebrate this meaningful moment with you.</p><p>{{ IMPACT_PRODUCT_CARD }}</p><p>{{ CAMPAIGN_CONTEXT_CARD }}</p>',
    imageUrl: 'https://placehold.co/600x300/2563eb/ffffff?text=Gift+eCard',
    createdAt: '2025-01-15T10:00:00Z',
    updatedAt: '2026-01-20T14:30:00Z'
  },
  {
    id: 'email-ecard-in-memory',
    name: 'eCard: In Memory',
    type: 'ecard-in-memory',
    subject: 'A donation was made in memory of {{ HONOREE_NAME }}',
    bodyHtml:
      '<p>Dear {{ FIRST_NAME }},</p><p>{{ DONOR_NAME }} made a gift of {{ AMOUNT }} in memory of {{ HONOREE_NAME }}.</p><p>Thank you for helping us honor their memory through compassionate action.</p><p>{{ IMPACT_PRODUCT_CARD }}</p><p>{{ CAMPAIGN_CONTEXT_CARD }}</p>',
    imageUrl: 'https://placehold.co/600x300/6b7280/ffffff?text=In+Memory',
    createdAt: '2025-02-01T10:00:00Z',
    updatedAt: '2026-01-18T11:00:00Z'
  },
  {
    id: 'email-donor-donation-success',
    name: 'Donation Success',
    type: 'donor-donation-success',
    subject: 'Thank you for your support, {{ FIRST_NAME }}',
    bodyHtml:
      '<p>Dear {{ FIRST_NAME }},</p><p>Thank you for your gift of {{ AMOUNT }} on {{ DATE }}.</p><p>Your support helps us continue this work with care and consistency.</p><p>{{ DONATION_SUMMARY_CARD }}</p><p>{{ ORDER_BREAKDOWN_CARD }}</p><p>{{ CAMPAIGN_CONTEXT_CARD }}</p><p>{{ IMPACT_PRODUCT_CARD }}</p>',
    imageUrl: 'https://placehold.co/600x300/16a34a/ffffff?text=Thank+You',
    createdAt: '2025-03-01T10:00:00Z',
    updatedAt: '2026-01-15T09:00:00Z'
  },
  {
    id: 'email-donor-new-subscription',
    name: 'New Subscription',
    type: 'donor-new-subscription',
    subject: 'Your {{ FREQUENCY }} support is now active',
    bodyHtml:
      '<p>Dear {{ FIRST_NAME }},</p><p>Your {{ FREQUENCY }} support of {{ AMOUNT }} is now active.</p><p>Your next billing date is {{ NEXT_BILLING_DATE }}.</p><p>{{ SUBSCRIPTION_STATUS_CARD }}</p><p>{{ ORDER_BREAKDOWN_CARD }}</p><p>{{ PAYMENT_METHOD_CARD }}</p><p>{{ IMPACT_PRODUCT_CARD }}</p>',
    imageUrl: '',
    createdAt: '2025-03-10T10:00:00Z',
    updatedAt: '2026-01-10T09:00:00Z'
  },
  {
    id: 'email-donor-subscription-paused',
    name: 'Subscription Paused',
    type: 'donor-subscription-paused',
    subject: 'Your subscription is paused',
    bodyHtml:
      '<p>Dear {{ FIRST_NAME }},</p><p>Your {{ FREQUENCY }} support has been paused, and no further payments will be taken until you resume.</p><p>{{ SUBSCRIPTION_STATUS_CARD }}</p>',
    imageUrl: '',
    createdAt: '2025-03-15T10:00:00Z',
    updatedAt: '2026-01-08T09:00:00Z'
  },
  {
    id: 'email-donor-subscription-resumed',
    name: 'Subscription Resumed',
    type: 'donor-subscription-resumed',
    subject: 'Your subscription is active again',
    bodyHtml:
      '<p>Dear {{ FIRST_NAME }},</p><p>Your {{ FREQUENCY }} support is active again.</p><p>Your next billing date is {{ NEXT_BILLING_DATE }}.</p><p>{{ SUBSCRIPTION_STATUS_CARD }}</p><p>{{ IMPACT_PRODUCT_CARD }}</p>',
    imageUrl: '',
    createdAt: '2025-03-20T10:00:00Z',
    updatedAt: '2026-01-05T09:00:00Z'
  },
  {
    id: 'email-donor-subscription-cancelled',
    name: 'Subscription Cancelled',
    type: 'donor-subscription-cancelled',
    subject: 'Your subscription has been cancelled',
    bodyHtml:
      '<p>Dear {{ FIRST_NAME }},</p><p>Your subscription has now been cancelled, and you will not be charged again.</p><p>We are grateful for your support and would be glad to welcome you back in the future.</p><p>{{ SUBSCRIPTION_STATUS_CARD }}</p>',
    imageUrl: '',
    createdAt: '2025-04-01T10:00:00Z',
    updatedAt: '2026-01-03T09:00:00Z'
  },
  {
    id: 'email-donor-payment-failed',
    name: 'Recurring Payment Failed',
    type: 'donor-payment-failed',
    subject: 'Action needed: we could not process your {{ FREQUENCY }} payment',
    bodyHtml:
      '<p>Dear {{ FIRST_NAME }},</p><p>We were unable to process your {{ FREQUENCY }} payment of {{ AMOUNT }}.</p><p>Please review your payment details so your support can continue without interruption.</p><p>{{ PAYMENT_RETRY_CARD }}</p><p>{{ PAYMENT_METHOD_CARD }}</p><p>{{ SUBSCRIPTION_STATUS_CARD }}</p>',
    imageUrl: '',
    createdAt: '2025-04-10T10:00:00Z',
    updatedAt: '2026-01-01T09:00:00Z'
  }
]
