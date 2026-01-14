/**
 * Campaign Types
 *
 * Core types for campaign management
 */

export type CampaignStatus = 'draft' | 'active' | 'paused' | 'completed' | 'archived'

export type FundraiserType = 'individual' | 'team' | 'organization'

/**
 * Campaign fundraiser/team member
 */
export interface CampaignFundraiser {
  id: string
  name: string
  email: string
  type: FundraiserType
  joinedAt: string
  raisedAmount: number
  donationCount: number
}

/**
 * Campaign statistics
 */
export interface CampaignStats {
  totalRaised: number
  totalDonations: number
  totalDonors: number
  goalAmount?: number
  includeGiftAidInGoal?: boolean
  averageDonation: number
  topDonation: number
  daysRemaining?: number
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
  allowPeerToPeerFundraising: boolean
  wordpressPluginEnabled: boolean
}

/**
 * About the charity section
 */
export interface CharityInfo {
  name: string
  registrationNumber: string
  website: string
  description: string
}

/**
 * Social sharing settings
 */
export interface SocialSharingSettings {
  facebook: boolean
  twitter: boolean
  linkedin: boolean
  whatsapp: boolean
  email: boolean
  copyLink: boolean
}

/**
 * Complete campaign configuration
 */
export interface Campaign {
  id: string
  name: string
  status: CampaignStatus
  createdAt: string
  updatedAt: string
  stats: CampaignStats
  crowdfunding: CrowdfundingSettings
  charity: CharityInfo
  socialSharing: SocialSharingSettings
  fundraisers: CampaignFundraiser[]
}
