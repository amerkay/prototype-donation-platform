/**
 * Receipt HTML fragment builder — single source of truth.
 *
 * Returns an HTML fragment with inline styles that renders identically in:
 * - Vue preview (via v-html)
 * - Puppeteer PDF (wrapped in a full HTML page)
 */

import { escapeHtml } from './utils'

export interface ReceiptFragmentData {
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

const SEPARATOR = '<div style="height: 1px; width: 100%; background-color: #e5e7eb;"></div>'

export function buildReceiptFragment(data: ReceiptFragmentData): string {
  const { branding, charity, donation } = data

  const logoHtml =
    data.showLogo && branding.logoUrl
      ? `<div style="display: flex; justify-content: center; margin-bottom: 1rem;">
        <img src="${branding.logoUrl}" alt="Logo" style="height: 3rem; width: auto; object-fit: contain;" />
      </div>`
      : ''

  const campaignRow =
    data.showCampaignName && donation.campaign
      ? `<div style="display: flex; justify-content: space-between; margin-bottom: 0.5rem;">
        <span style="color: #6b7280;">Campaign</span>
        <span style="font-weight: 500;">${escapeHtml(donation.campaign)}</span>
      </div>`
      : ''

  const paymentRow =
    data.showPaymentMethod && donation.paymentMethod
      ? `<div style="display: flex; justify-content: space-between; margin-bottom: 0.5rem;">
        <span style="color: #6b7280;">Payment</span>
        <span style="font-weight: 500;">${escapeHtml(donation.paymentMethod)}</span>
      </div>`
      : ''

  const giftAidHtml = data.showGiftAid
    ? `<div style="margin-top: 1rem; padding: 0.75rem; border-radius: 0.25rem; border: 1px dashed #e5e7eb; font-size: 0.75rem; color: #4b5563;">
        <p style="font-weight: 500; color: #000; margin-bottom: 0.25rem;">Gift Aid Declaration</p>
        <p style="margin: 0;">This donation qualifies for Gift Aid, increasing its value by 25% at no extra cost to you.</p>
      </div>`
    : ''

  return `<div style="width: 100%; height: 100%; background: #fff; overflow: hidden;">
  <div style="padding: 2rem; font-size: 0.875rem; color: #000;">
    <!-- Header bar -->
    <div style="height: 0.375rem; border-radius: 9999px; margin-bottom: 1.5rem; background-color: ${branding.primaryColor};"></div>

    ${logoHtml}

    <!-- Charity info -->
    <div style="text-align: center; margin-bottom: 1rem;">
      <h3 style="font-size: 1.125rem; font-weight: 700; margin: 0;">${escapeHtml(charity.name)}</h3>
      <p style="font-size: 0.75rem; color: #6b7280; margin: 0.125rem 0 0;">Reg. No. ${escapeHtml(charity.registrationNumber)}</p>
      <p style="font-size: 0.75rem; color: #6b7280; margin: 0.125rem 0 0;">${escapeHtml(charity.address)}</p>
    </div>

    <h4 style="text-align: center; font-weight: 600; margin-bottom: 1rem; font-size: 0.875rem;">Donation Receipt</h4>

    <p style="text-align: center; color: #4b5563; margin-bottom: 1rem; font-size: 0.75rem; font-style: italic;">${escapeHtml(data.headerText)}</p>

    <div style="margin: 1rem 0;">${SEPARATOR}</div>

    <!-- Donation details -->
    <div style="font-size: 0.75rem;">
      <div style="display: flex; justify-content: space-between; margin-bottom: 0.5rem;">
        <span style="color: #6b7280;">Receipt No.</span>
        <span style="font-weight: 500;">${escapeHtml(donation.receiptNumber)}</span>
      </div>
      <div style="display: flex; justify-content: space-between; margin-bottom: 0.5rem;">
        <span style="color: #6b7280;">Date</span>
        <span style="font-weight: 500;">${escapeHtml(donation.date)}</span>
      </div>
      <div style="display: flex; justify-content: space-between; margin-bottom: 0.5rem;">
        <span style="color: #6b7280;">Donor</span>
        <span style="font-weight: 500;">${escapeHtml(donation.donorName)}</span>
      </div>
      ${campaignRow}
      ${paymentRow}

      <div style="margin: 0.75rem 0;">${SEPARATOR}</div>

      <div style="display: flex; justify-content: space-between; font-size: 1rem; font-weight: 700;">
        <span>Amount</span>
        <span>${escapeHtml(donation.amount)}</span>
      </div>
    </div>

    ${giftAidHtml}

    <div style="margin: 1rem 0;">${SEPARATOR}</div>

    <!-- Footer -->
    <p style="font-size: 0.75rem; color: #9ca3af; text-align: center;">${escapeHtml(data.footerText)}</p>

    <!-- Bottom bar -->
    <div style="height: 0.25rem; border-radius: 9999px; margin-top: 1.5rem; background-color: ${branding.primaryColor};"></div>
  </div>
</div>`
}
