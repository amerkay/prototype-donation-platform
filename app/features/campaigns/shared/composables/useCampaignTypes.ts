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
      return { label: 'Standard', href: '/admin/campaigns/standard' }
    case 'p2p':
      return { label: 'P2P Templates', href: '/admin/campaigns/p2p' }
    case 'fundraiser':
      return { label: 'My Fundraisers', href: '/admin/campaigns/fundraisers' }
    default:
      return { label: 'Campaigns', href: '/admin/campaigns/standard' }
  }
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
