/**
 * Campaign Types
 *
 * Core types for campaign management
 */

import type { FullFormConfig } from '~/features/donation-form/shared/stores/formConfig'
import type { Product } from '~/features/donation-form/features/product/shared/types'

export type CampaignStatus = 'draft' | 'active' | 'paused' | 'completed' | 'archived'

export type CampaignType = 'standard' | 'p2p' | 'fundraiser'

export type P2PPreset = 'birthday' | 'tribute' | 'challenge' | 'wedding' | 'custom'

export type FundraiserStatus = 'active' | 'paused' | 'removed'

/**
 * Campaign fundraiser (lightweight metadata for stats rollup)
 * The actual fundraiser is a full Campaign object with type: 'fundraiser'
 */
export interface CampaignFundraiser {
  id: string
  campaignId: string // References the full Campaign.id of fundraiser campaign
  parentCampaignId: string // The P2P template campaign this fundraiser belongs to
  name: string
  email: string
  joinedAt: string
  raisedAmount: number
  donationCount: number
  /** Currency for raisedAmount and goal (org base currency) */
  currency: string
  goal?: number
  slug: string
  story?: string
  coverPhoto?: string
  status: FundraiserStatus
}

/**
 * Individual donation record for preview
 */
export interface CampaignDonation {
  id: string
  donorName: string
  amount: number
  /** Original transaction currency */
  currency: string
  message?: string
  isAnonymous: boolean
  createdAt: string
}

/**
 * Campaign statistics
 */
export interface CampaignStats {
  totalRaised: number
  totalDonations: number
  totalDonors: number
  averageDonation: number
  topDonation: number
  /** Currency stats are denominated in (org base currency) */
  currency: string
}

/**
 * Crowdfunding page settings
 */
export interface CrowdfundingSettings {
  enabled: boolean
  coverPhoto?: string
  title: string
  shortDescription: string
  story: string
  showProgressBar: boolean
  showRecentDonations: boolean
  defaultDonationsView: 'recent' | 'top'
  numberOfDonationsToShow: number
  goalAmount?: number
  /** Campaign end date (ISO date string, e.g. '2026-03-22'), null when cleared */
  endDate?: string | null
}

/**
 * Peer-to-peer fundraising settings
 */
export interface PeerToPeerSettings {
  enabled: boolean
  customMessage?: string
}

/**
 * Social sharing settings
 */
export interface SocialSharingSettings {
  enabled: boolean
  facebook: boolean
  twitter: boolean
  linkedin: boolean
  whatsapp: boolean
  email: boolean
  copyLink: boolean
}

/**
 * Donation form for a campaign
 */
export interface CampaignForm {
  id: string
  campaignId: string
  name: string
  isDefault: boolean
  config: FullFormConfig
  products: Product[]
  createdAt: string
  updatedAt: string
}

/**
 * Complete campaign configuration
 */
export interface Campaign {
  id: string
  type: CampaignType
  p2pPreset?: P2PPreset
  parentCampaignId?: string // For fundraiser campaigns, links to P2P template
  name: string
  status: CampaignStatus
  createdAt: string
  updatedAt: string
  stats: CampaignStats
  crowdfunding: CrowdfundingSettings
  peerToPeer: PeerToPeerSettings
  socialSharing: SocialSharingSettings
  fundraisers: CampaignFundraiser[]
  recentDonations: CampaignDonation[]
  forms: CampaignForm[]
}
