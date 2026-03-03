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
  /** Match multiplier for this period (1-10 integer) */
  multiplier: number
  /** Total pool amount committed by matcher (in campaign currency) */
  poolAmount: number
  /** Amount already drawn from pool (sum of match portions of donations) */
  poolDrawn: number
  /** Period start (ISO datetime) */
  startDate: string
  /** Period end (ISO datetime) */
  endDate: string
  /** Matcher identity */
  matcherName?: string
  matcherLogo?: string
  /** Custom message shown to donors during this period */
  displayMessage?: string
}

/**
 * Matched giving settings (any campaign type can enable matching via periods)
 */
export interface MatchedGivingSettings {
  /** All match periods for this campaign (ordered by startDate) */
  periods: MatchPeriod[]
}
