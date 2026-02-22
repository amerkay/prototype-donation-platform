/**
 * Hard-coded system email templates — not editable by admins.
 * These are rendered server-side using DonationEmail.vue at send time.
 */

export interface SystemEmailTemplate {
  subject: string
  bodyHtml: string
}

export type SystemEmailTemplateType =
  | 'admin-new-donation'
  | 'admin-new-p2p-fundraiser'
  | 'p2p-new-donation'
  | 'team-invitation'

export const SYSTEM_EMAIL_TEMPLATES: Record<SystemEmailTemplateType, SystemEmailTemplate> = {
  'admin-new-donation': {
    subject: 'New {{ FREQUENCY }} donation: {{ AMOUNT }}',
    bodyHtml:
      '<p>A new donation has been received.</p><p>{{ DONATION_SUMMARY_CARD }}</p><p><strong>Donor:</strong> {{ DONOR_NAME }}</p>'
  },
  'admin-new-p2p-fundraiser': {
    subject: 'New P2P fundraiser created: {{ FUNDRAISER_NAME }}',
    bodyHtml:
      '<p>A new P2P fundraiser has been created.</p><p><strong>Fundraiser:</strong> {{ FUNDRAISER_NAME }}<br/><strong>Campaign:</strong> {{ CAMPAIGN_NAME }}<br/><strong>Goal:</strong> {{ GOAL_AMOUNT }}</p>'
  },
  'p2p-new-donation': {
    subject: '{{ DONOR_NAME }} just supported your fundraiser',
    bodyHtml:
      '<p>Great news, {{ FUNDRAISER_NAME }}.</p><p>{{ DONOR_NAME }} donated {{ AMOUNT }} to your fundraiser.</p><p>Your total raised is now {{ TOTAL_RAISED }}.</p>'
  },
  'team-invitation': {
    subject: "You're invited to join {{ ORG_NAME }}",
    bodyHtml:
      '<p>Hi {{ INVITEE_NAME }},</p><p>You have been invited to join {{ ORG_NAME }} as a {{ ROLE }}.</p><p><a href="{{ INVITE_LINK }}">Accept your invitation</a></p>'
  }
} as const
