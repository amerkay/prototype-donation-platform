/**
 * Campaign Types
 *
 * Core types for campaign management
 */

import type { FullFormConfig } from '~/features/donation-form/shared/stores/formConfig'
import type { Product } from '~/features/donation-form/features/product/shared/types'

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
 * Individual donation record for preview
 */
export interface CampaignDonation {
  id: string
  donorName: string
  amount: number
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
  goalAmount?: number
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
}

/**
 * Peer-to-peer fundraising settings
 */
export interface PeerToPeerSettings {
  enabled: boolean
  allowIndividuals: boolean
  allowTeams: boolean
  fundraiserGoalDefault?: number
  customMessage?: string
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
  name: string
  status: CampaignStatus
  createdAt: string
  updatedAt: string
  stats: CampaignStats
  crowdfunding: CrowdfundingSettings
  peerToPeer: PeerToPeerSettings
  charity: CharityInfo
  socialSharing: SocialSharingSettings
  fundraisers: CampaignFundraiser[]
  recentDonations: CampaignDonation[]
  forms: CampaignForm[]
}
