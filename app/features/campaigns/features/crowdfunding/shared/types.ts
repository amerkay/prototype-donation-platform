/**
 * Crowdfunding page settings
 */
export interface CrowdfundingSettings {
  enabled: boolean
  /** Campaign currency for goal display and default donation currency (defaults to org defaultCurrency) */
  currency?: string
  coverPhoto?: string
  title: string
  shortDescription: string
  story?: string
  showProgressBar: boolean
  showRecentDonations: boolean
  defaultDonationsView: 'recent' | 'top'
  numberOfDonationsToShow: number
  goalAmount?: number
  /** Campaign end date (ISO date string, e.g. '2026-03-22'), null when cleared */
  endDate?: string | null
  /** Whether social sharing is enabled for this campaign */
  enableSocialSharing: boolean
}
