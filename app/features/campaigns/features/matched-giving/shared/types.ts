/** Status of a match period, derived from dates + pool (not stored) */
export type MatchPeriodStatus = 'scheduled' | 'active' | 'exhausted' | 'ended'

/**
 * A single match period within a campaign that has matched giving enabled.
 * Each period has its own matcher, multiplier, and depleting pool.
 * Periods must not overlap in date ranges.
 */
export interface MatchPeriod {
  id: string
  /** Display name for admin (e.g., "Launch Week Double Match") */
  name: string
  /**
   * Match multiplier: the total impact factor shown to donors.
   * 2 = "2× match" (donor's £10 becomes £20 — pool draws £10).
   * 3 = "3× match" (donor's £10 becomes £30 — pool draws £20).
   * Internally: matchPortion = donationAmount × (matchMultiplier - 1).
   */
  matchMultiplier: number
  /** Total pool amount committed by matcher (in campaign currency) */
  poolAmount: number
  /** Amount already drawn from pool — trigger-maintained, read-only in app */
  poolDrawn: number
  /** Period start (ISO datetime) */
  startDate: string
  /** Period end (ISO datetime) */
  endDate: string
  /** Matcher identity */
  matcherName?: string
  matcherLogo?: string
  /** Custom message shown to donors during this period (max 120 chars) */
  displayMessage?: string
}

/**
 * Matched giving settings for a campaign.
 * Periods are stored in the dedicated match_periods table (not campaign JSONB).
 */
export interface MatchedGivingSettings {
  /** All match periods for this campaign (ordered by startDate) */
  periods: MatchPeriod[]
}
