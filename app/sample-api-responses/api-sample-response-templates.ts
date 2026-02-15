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

export const emailTemplates: EmailTemplate[] = [
  {
    id: 'email-ecard-gift',
    name: 'eCard: Gift',
    type: 'ecard-gift',
    subject: 'A gift has been made in your honor, {{ FIRST_NAME }}!',
    bodyHtml:
      '<p>Dear {{ FIRST_NAME }},</p><p>{{ DONOR_NAME }} has made a generous gift of {{ AMOUNT }} in your honor on {{ DATE }}.</p><p>Their kindness helps protect endangered orangutans and their rainforest home.</p><p>{{ IMPACT_PRODUCT_CARD }}</p>',
    imageUrl: 'https://placehold.co/600x300/2563eb/ffffff?text=Gift+eCard',
    createdAt: '2025-01-15T10:00:00Z',
    updatedAt: '2026-01-20T14:30:00Z'
  },
  {
    id: 'email-ecard-in-memory',
    name: 'eCard: In Memory',
    type: 'ecard-in-memory',
    subject: 'A donation has been made in memory of {{ HONOREE_NAME }}',
    bodyHtml:
      '<p>Dear {{ FIRST_NAME }},</p><p>A gift of {{ AMOUNT }} has been made in memory of {{ HONOREE_NAME }} by {{ DONOR_NAME }}.</p><p>Their memory lives on through this act of kindness.</p><p>{{ IMPACT_PRODUCT_CARD }}</p>',
    imageUrl: 'https://placehold.co/600x300/6b7280/ffffff?text=In+Memory',
    createdAt: '2025-02-01T10:00:00Z',
    updatedAt: '2026-01-18T11:00:00Z'
  },
  {
    id: 'email-donor-donation-success',
    name: 'Donation Success',
    type: 'donor-donation-success',
    subject: 'Thank you for your donation, {{ FIRST_NAME }}!',
    bodyHtml:
      '<p>Dear {{ FIRST_NAME }},</p><p>Thank you for your generous gift of {{ AMOUNT }} to {{ CAMPAIGN_NAME }} on {{ DATE }}.</p><p>Your support makes a real difference for orangutan conservation.</p><p>{{ IMPACT_PRODUCT_CARD }}</p>',
    imageUrl: 'https://placehold.co/600x300/16a34a/ffffff?text=Thank+You',
    createdAt: '2025-03-01T10:00:00Z',
    updatedAt: '2026-01-15T09:00:00Z'
  },
  {
    id: 'email-donor-new-subscription',
    name: 'New Subscription',
    type: 'donor-new-subscription',
    subject: 'Your {{ FREQUENCY }} subscription is confirmed!',
    bodyHtml:
      '<p>Dear {{ FIRST_NAME }},</p><p>Your {{ FREQUENCY }} subscription of {{ AMOUNT }} has been set up successfully.</p><p>Your next billing date is {{ NEXT_BILLING_DATE }}. You can manage your subscription at any time from your donor portal.</p><p>{{ IMPACT_PRODUCT_CARD }}</p>',
    imageUrl: '',
    createdAt: '2025-03-10T10:00:00Z',
    updatedAt: '2026-01-10T09:00:00Z'
  },
  {
    id: 'email-donor-subscription-paused',
    name: 'Subscription Paused',
    type: 'donor-subscription-paused',
    subject: 'Your subscription has been paused',
    bodyHtml:
      "<p>Dear {{ FIRST_NAME }},</p><p>Your {{ FREQUENCY }} subscription of {{ AMOUNT }} has been paused. You won't be charged until you resume it.</p><p>You can resume your subscription at any time from your donor portal.</p>",
    imageUrl: '',
    createdAt: '2025-03-15T10:00:00Z',
    updatedAt: '2026-01-08T09:00:00Z'
  },
  {
    id: 'email-donor-subscription-resumed',
    name: 'Subscription Resumed',
    type: 'donor-subscription-resumed',
    subject: 'Your subscription has been resumed!',
    bodyHtml:
      '<p>Dear {{ FIRST_NAME }},</p><p>Your {{ FREQUENCY }} subscription of {{ AMOUNT }} has been resumed.</p><p>Your next billing date is {{ NEXT_BILLING_DATE }}. Thank you for your continued support!</p><p>{{ IMPACT_PRODUCT_CARD }}</p>',
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
      "<p>Dear {{ FIRST_NAME }},</p><p>Your subscription has been cancelled. You will not be charged again.</p><p>If you'd like to support us again in the future, you can always start a new subscription.</p>",
    imageUrl: '',
    createdAt: '2025-04-01T10:00:00Z',
    updatedAt: '2026-01-03T09:00:00Z'
  },
  {
    id: 'email-donor-payment-failed',
    name: 'Recurring Payment Failed',
    type: 'donor-payment-failed',
    subject: 'Action needed: Your {{ FREQUENCY }} payment failed',
    bodyHtml:
      '<p>Dear {{ FIRST_NAME }},</p><p>We were unable to process your {{ FREQUENCY }} payment of {{ AMOUNT }}.</p><p>Please update your payment method in your donor portal to avoid interruption to your subscription.</p>',
    imageUrl: '',
    createdAt: '2025-04-10T10:00:00Z',
    updatedAt: '2026-01-01T09:00:00Z'
  },
  {
    id: 'email-admin-new-donation',
    name: 'New Donation',
    type: 'admin-new-donation',
    subject: 'New {{ FREQUENCY }} donation of {{ AMOUNT }}',
    bodyHtml:
      '<p>A new donation has been received:</p><p><strong>Donor:</strong> {{ DONOR_NAME }}<br/><strong>Amount:</strong> {{ AMOUNT }}<br/><strong>Campaign:</strong> {{ CAMPAIGN_NAME }}<br/><strong>Date:</strong> {{ DATE }}<br/><strong>Frequency:</strong> {{ FREQUENCY }}</p>',
    imageUrl: '',
    createdAt: '2025-05-01T10:00:00Z',
    updatedAt: '2025-12-28T09:00:00Z'
  },
  {
    id: 'email-admin-new-p2p-fundraiser',
    name: 'New P2P Fundraiser',
    type: 'admin-new-p2p-fundraiser',
    subject: 'New P2P fundraiser: {{ FUNDRAISER_NAME }}',
    bodyHtml:
      '<p>A new P2P fundraiser has been created:</p><p><strong>Fundraiser:</strong> {{ FUNDRAISER_NAME }}<br/><strong>Campaign:</strong> {{ CAMPAIGN_NAME }}<br/><strong>Goal:</strong> {{ GOAL_AMOUNT }}</p>',
    imageUrl: '',
    createdAt: '2025-05-10T10:00:00Z',
    updatedAt: '2025-12-25T09:00:00Z'
  },
  {
    id: 'email-p2p-new-donation',
    name: 'New Donation',
    type: 'p2p-new-donation',
    subject: '{{ DONOR_NAME }} donated {{ AMOUNT }} to your fundraiser!',
    bodyHtml:
      "<p>Great news! {{ DONOR_NAME }} has donated {{ AMOUNT }} to your fundraiser.</p><p>You've now raised {{ TOTAL_RAISED }} in total. Keep up the amazing work, {{ FUNDRAISER_NAME }}!</p>",
    imageUrl: '',
    createdAt: '2025-06-01T10:00:00Z',
    updatedAt: '2025-12-20T09:00:00Z'
  },
  {
    id: 'email-team-invitation',
    name: 'Team Invitation',
    type: 'team-invitation',
    subject: "You've been invited to join {{ ORG_NAME }}",
    bodyHtml:
      '<p>Hi {{ INVITEE_NAME }},</p><p>You\'ve been invited to join {{ ORG_NAME }} as a {{ ROLE }}.</p><p>Click the link below to accept your invitation:</p><p><a href="{{ INVITE_LINK }}">Accept Invitation</a></p>',
    imageUrl: '',
    createdAt: '2025-06-10T10:00:00Z',
    updatedAt: '2025-12-15T09:00:00Z'
  }
]
