import type { Campaign, CampaignType } from '~/features/campaigns/shared/types'

/**
 * Campaign type utilities for consistent labeling across the application
 * Pure utility functions - no composable state
 */

/**
 * Get human-readable label for campaign type
 */
export function getCampaignTypeLabel(campaign: Campaign | { type: CampaignType }): string {
  switch (campaign.type) {
    case 'standard':
      return 'Standard'
    case 'p2p':
      return 'Peer-to-peer Template'
    case 'p2p-fundraiser':
      return 'Peer-to-peer (P2P)'
    case 'event':
      return 'Event'
    default:
      return 'Standard'
  }
}

/**
 * Get short label for campaign type (for badges in tight spaces)
 */
export function getCampaignTypeShortLabel(campaign: Campaign | { type: CampaignType }): string {
  switch (campaign.type) {
    case 'standard':
      return 'Standard'
    case 'p2p':
      return 'P2P Template'
    case 'p2p-fundraiser':
      return 'P2P'
    case 'event':
      return 'Event'
    default:
      return 'Standard'
  }
}

/**
 * Get breadcrumb info for campaign type (label and href for list page)
 */
export function getCampaignTypeBreadcrumb(campaign: Campaign | { type: CampaignType }): {
  label: string
  href: string
} {
  switch (campaign.type) {
    case 'standard':
      return { label: 'Campaigns', href: '/admin/campaigns' }
    case 'p2p':
      return { label: 'P2P Templates', href: '/admin/p2p/templates' }
    case 'p2p-fundraiser':
      return { label: 'Fundraiser Pages', href: '/admin/p2p/fundraisers' }
    case 'event':
      return { label: 'Campaigns', href: '/admin/campaigns' }
    default:
      return { label: 'Campaigns', href: '/admin/campaigns' }
  }
}

/**
 * Get the admin edit/detail URL for a campaign based on its type.
 * P2P templates → /admin/p2p/templates/[id], others → /admin/campaigns/[id]
 */
export function getCampaignEditPath(type: CampaignType, id: string): string {
  if (type === 'p2p') return `/admin/p2p/templates/${id}`
  return `/admin/campaigns/${id}`
}

/**
 * Get badge variant for campaign type
 */
export function getCampaignTypeBadgeVariant(
  type: CampaignType
): 'outline' | 'secondary' | 'default' {
  switch (type) {
    case 'p2p':
      return 'secondary'
    case 'p2p-fundraiser':
      return 'default'
    case 'event':
      return 'outline'
    default:
      return 'outline'
  }
}
