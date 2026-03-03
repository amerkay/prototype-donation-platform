import type { CampaignType } from '~/features/campaigns/shared/types'

// Re-exported from matched-giving sub-feature (canonical location)
import type { DonationFrequency } from '~/features/campaigns/features/matched-giving/shared/utils/matchPeriodUtils'
export type {
  DonationFrequency,
  MatchDisplayMode
} from '~/features/campaigns/features/matched-giving/shared/utils/matchPeriodUtils'
export {
  getPeriodStatus,
  getActivePeriod,
  getMatchDisplayMode,
  getDisplayPeriod,
  calculateMatch
} from '~/features/campaigns/features/matched-giving/shared/utils/matchPeriodUtils'

/**
 * Campaign capabilities — single source of truth for feature gating by campaign type.
 *
 * All UI visibility checks should read from this function rather than
 * scattering type checks throughout forms, components, and stores.
 */

export interface CampaignCapabilities {
  /** Which donation frequencies this campaign type supports */
  allowedFrequencies: DonationFrequency[]
  /** Shorthand: allows monthly or yearly */
  allowsRecurring: boolean
  /** Can configure preset/custom donation amounts */
  allowsDonationAmounts: boolean
  /** Can use product selector (admin-configurable product grid) */
  allowsProductSelector: boolean
  /** Can use impact cart (multi-item cart) */
  allowsImpactCart: boolean
  /** Impact boost capability: 'full' (recurring + increase), 'increase-only', or false */
  allowsImpactBoost: 'full' | 'increase-only' | false
  /** Can enable cover-costs feature */
  allowsCoverCosts: boolean
  /** Can enable Gift Aid */
  allowsGiftAid: boolean
  /** Can enable tribute/memorial giving */
  allowsTribute: boolean
  /** Can enable entry fields (registration-style per-item fields) */
  allowsEntryFields: boolean
  /** Can enable custom fields */
  allowsCustomFields: boolean
  /** Can spawn P2P fundraiser pages */
  allowsP2P: boolean
  /** Has matched giving configuration section */
  allowsMatchedGiving: boolean
  /** Whether end date is required, optional, or not applicable */
  endDateMode: 'required' | 'optional' | 'none'
  /** Derived form type for UI labelling and template filtering */
  formType: 'donation' | 'registration'
}

const CAPABILITIES: Record<CampaignType, CampaignCapabilities> = {
  standard: {
    allowedFrequencies: ['once', 'monthly', 'yearly'],
    allowsRecurring: true,
    allowsDonationAmounts: true,
    allowsProductSelector: true,
    allowsImpactCart: true,
    allowsImpactBoost: 'full',
    allowsCoverCosts: true,
    allowsGiftAid: true,
    allowsTribute: true,
    allowsEntryFields: false,
    allowsCustomFields: true,
    allowsP2P: false,
    allowsMatchedGiving: true,
    endDateMode: 'optional',
    formType: 'donation'
  },
  p2p: {
    allowedFrequencies: ['once'],
    allowsRecurring: false,
    allowsDonationAmounts: true,
    allowsProductSelector: true,
    allowsImpactCart: true,
    allowsImpactBoost: 'increase-only',
    allowsCoverCosts: true,
    allowsGiftAid: true,
    allowsTribute: true,
    allowsEntryFields: false,
    allowsCustomFields: true,
    allowsP2P: true,
    allowsMatchedGiving: true,
    endDateMode: 'none',
    formType: 'donation'
  },
  'p2p-fundraiser': {
    allowedFrequencies: ['once'],
    allowsRecurring: false,
    allowsDonationAmounts: true,
    allowsProductSelector: true,
    allowsImpactCart: true,
    allowsImpactBoost: 'increase-only',
    allowsCoverCosts: true,
    allowsGiftAid: true,
    allowsTribute: true,
    allowsEntryFields: false,
    allowsCustomFields: true,
    allowsP2P: false,
    allowsMatchedGiving: false,
    endDateMode: 'optional',
    formType: 'donation'
  },
  event: {
    allowedFrequencies: ['once'],
    allowsRecurring: false,
    allowsDonationAmounts: false,
    allowsProductSelector: false,
    allowsImpactCart: true,
    allowsImpactBoost: false,
    allowsCoverCosts: true,
    allowsGiftAid: true,
    allowsTribute: false,
    allowsEntryFields: true,
    allowsCustomFields: true,
    allowsP2P: false,
    allowsMatchedGiving: true,
    endDateMode: 'optional',
    formType: 'registration'
  }
}

/**
 * Get the full capabilities object for a campaign type.
 * This is the single source of truth — all UI gating should use this.
 */
export function getCampaignCapabilities(type: CampaignType): CampaignCapabilities {
  return CAPABILITIES[type]
}

/**
 * Derive the form type from campaign type (replaces FormType on FormSettings).
 */
export function getFormType(campaignType: CampaignType): 'donation' | 'registration' {
  return getCampaignCapabilities(campaignType).formType
}
