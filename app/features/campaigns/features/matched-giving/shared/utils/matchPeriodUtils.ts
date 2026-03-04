import type { MatchPeriod, MatchPeriodStatus } from '../types'

export type DonationFrequency = 'once' | 'monthly' | 'yearly'

/** How a matched-giving card should render based on campaign + period state. */
export type MatchDisplayMode = 'active' | 'historical' | 'hidden'

/**
 * Compute the status of a match period from its dates and pool usage.
 * Priority: exhausted > date-based (scheduled/active/ended).
 */
export function getPeriodStatus(period: MatchPeriod, now: Date = new Date()): MatchPeriodStatus {
  if (period.poolDrawn >= period.poolAmount) return 'exhausted'
  if (now < new Date(period.startDate)) return 'scheduled'
  if (now > new Date(period.endDate)) return 'ended'
  return 'active'
}

/**
 * Find the currently active match period (first with status 'active').
 */
export function getActivePeriod(
  periods: MatchPeriod[],
  now: Date = new Date()
): MatchPeriod | null {
  return periods.find((p) => getPeriodStatus(p, now) === 'active') ?? null
}

/**
 * Determine display mode for matched giving based on campaign status and period state.
 * Uses the campaign's own totalMatched (from its transactions) rather than the shared
 * poolDrawn on periods, so fundraisers only show matching if they actually have matched donations.
 *
 * Priority:
 * 1. Active period exists AND campaign can still receive donations → 'active'
 * 2. Campaign has matched funds (totalMatched > 0) → 'historical'
 * 3. Otherwise → 'hidden'
 */
export function getMatchDisplayMode(
  periods: MatchPeriod[],
  campaignStatus?: string,
  now: Date = new Date(),
  totalMatched: number = 0
): MatchDisplayMode {
  const isTerminal = campaignStatus === 'completed' || campaignStatus === 'ended'

  // Active period + non-terminal campaign → show live matcher card
  if (!isTerminal && getActivePeriod(periods, now)) return 'active'

  // Has matched funds → show historical summary
  return totalMatched > 0 ? 'historical' : 'hidden'
}

/**
 * Get the most relevant period for display: active period if exists,
 * otherwise the period with the most pool drawn (best historical candidate).
 */
export function getDisplayPeriod(
  periods: MatchPeriod[],
  now: Date = new Date()
): MatchPeriod | null {
  return (
    getActivePeriod(periods, now) ??
    [...periods].sort((a, b) => b.poolDrawn - a.poolDrawn)[0] ??
    null
  )
}

/**
 * Effective raised amount including matched funds.
 * Uses stats.totalMatched (per-campaign transaction data) — NOT sum(poolDrawn) which is shared.
 */
export function getEffectiveRaised(stats: { totalRaised: number; totalMatched?: number }): number {
  return stats.totalRaised + (stats.totalMatched ?? 0)
}

/**
 * Calculate the match for a donation against the active period.
 * Returns the actual match amount (capped by remaining pool) and the period ID.
 * Only one-time donations are eligible for matching — recurring donations return 0.
 */
export function calculateMatch(
  donationAmount: number,
  periods: MatchPeriod[],
  frequency: DonationFrequency = 'once',
  now: Date = new Date()
): { matchedAmount: number; periodId?: string } {
  if (frequency !== 'once') return { matchedAmount: 0 }
  const active = getActivePeriod(periods, now)
  if (!active) return { matchedAmount: 0 }

  const matchPortion = donationAmount * (active.matchMultiplier - 1)
  const poolRemaining = active.poolAmount - active.poolDrawn
  const actualMatch = Math.min(matchPortion, poolRemaining)

  return { matchedAmount: Math.max(actualMatch, 0), periodId: active.id }
}
