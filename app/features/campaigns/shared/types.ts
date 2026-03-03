/**
 * Campaign Types
 *
 * Core types for campaign management
 */

import type { FullFormConfig } from '~/features/donation-form/shared/stores/formConfig'
import type { Product } from '~/features/donation-form/features/product/shared/types'

// Re-exported from crowdfunding sub-feature (canonical location)
import type { CrowdfundingSettings } from '~/features/campaigns/features/crowdfunding/shared/types'

// Re-exported from matched-giving sub-feature (canonical location)
import type { MatchedGivingSettings } from '~/features/campaigns/features/matched-giving/shared/types'

export type CampaignStatus = 'draft' | 'active' | 'completed' | 'ended'

/** Dropdown-selectable statuses (ended/completed are set via action buttons, not dropdown) */
export const CAMPAIGN_STATUS_OPTIONS: { value: CampaignStatus; label: string }[] = [
  { value: 'draft', label: 'Draft' },
  { value: 'active', label: 'Active' }
]

export type CampaignType = 'standard' | 'p2p' | 'p2p-fundraiser' | 'event'

export type P2PPreset = 'birthday' | 'tribute' | 'challenge' | 'wedding' | 'custom'

export type FundraiserStatus = 'active' | 'completed' | 'ended'

/** Dropdown-selectable statuses (ended/completed are set via action buttons) */
export const FUNDRAISER_STATUS_OPTIONS: { value: FundraiserStatus; label: string }[] = [
  { value: 'active', label: 'Active' }
]

/**
 * Campaign fundraiser (lightweight metadata for stats rollup)
 * The actual fundraiser is a full Campaign object with type: 'p2p-fundraiser'
 */
export interface CampaignFundraiser {
  id: string
  campaignId: string // References the full Campaign.id of fundraiser campaign
  parentCampaignId: string // The P2P template campaign this fundraiser belongs to
  name: string
  email: string
  createdAt: string
  raisedAmount: number
  donationCount: number
  /** Currency for raisedAmount and goal (org base currency) */
  currency: string
  goal?: number
  slug: string
  story?: string
  coverPhoto?: string
  status: FundraiserStatus
  isArchived: boolean
  completedAt?: string
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
  /** Match amount at time of donation (0 if no active period or pool exhausted) */
  matchedAmount?: number
  /** Which match period matched this donation (null if unmatched) */
  matchPeriodId?: string
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
  /** Currency stats are denominated in (campaign currency, set at creation) */
  currency: string
}
export type { CrowdfundingSettings } from '~/features/campaigns/features/crowdfunding/shared/types'

/**
 * Peer-to-peer fundraising settings
 */
export interface PeerToPeerSettings {
  enabled: boolean
  customMessage?: string
}
export type {
  MatchPeriodStatus,
  MatchPeriod,
  MatchedGivingSettings
} from '~/features/campaigns/features/matched-giving/shared/types'

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
  parentCampaignId?: string // For p2p-fundraiser campaigns, links to P2P template
  name: string
  status: CampaignStatus
  isArchived: boolean
  createdAt: string
  updatedAt: string
  stats: CampaignStats
  crowdfunding: CrowdfundingSettings
  peerToPeer: PeerToPeerSettings
  matchedGiving: MatchedGivingSettings
  fundraisers: CampaignFundraiser[]
  recentDonations: CampaignDonation[]
  /** Single form per campaign (null for newly created campaigns before template selection) */
  form: CampaignForm | null
}
