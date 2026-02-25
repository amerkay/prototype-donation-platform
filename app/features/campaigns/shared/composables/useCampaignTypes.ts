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
    case 'fundraiser':
      return 'Peer-to-peer (P2P)'
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
    case 'fundraiser':
      return 'P2P'
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
    case 'fundraiser':
      return { label: 'Fundraiser Pages', href: '/admin/p2p/fundraisers' }
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
    case 'fundraiser':
      return 'default'
    default:
      return 'outline'
  }
}
