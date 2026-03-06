import { describe, it, expect } from 'vitest'
import {
  calculateMatch,
  getActivePeriod,
  getPeriodStatus
} from '~/features/campaigns/features/matched-giving/shared/utils/matchPeriodUtils'
import type { MatchPeriod } from '~/features/campaigns/features/matched-giving/shared/types'

function createPeriod(overrides: Partial<MatchPeriod> = {}): MatchPeriod {
  return {
    id: 'mp-1',
    name: 'Spring Match',
    matchMultiplier: 2,
    poolAmount: 10000,
    poolDrawn: 0,
    startDate: '2026-01-01T00:00:00Z',
    endDate: '2026-12-31T23:59:59Z',
    ...overrides
  }
}

const NOW_IN_RANGE = new Date('2026-06-15T12:00:00Z')
const NOW_BEFORE = new Date('2025-06-15T12:00:00Z')
const NOW_AFTER = new Date('2027-06-15T12:00:00Z')

describe('getPeriodStatus', () => {
  it('returns active when now is within date range and pool not exhausted', () => {
    expect(getPeriodStatus(createPeriod(), NOW_IN_RANGE)).toBe('active')
  })

  it('returns scheduled when now is before start date', () => {
    expect(getPeriodStatus(createPeriod(), NOW_BEFORE)).toBe('scheduled')
  })

  it('returns ended when now is after end date', () => {
    expect(getPeriodStatus(createPeriod(), NOW_AFTER)).toBe('ended')
  })

  it('returns exhausted when pool is fully drawn', () => {
    const period = createPeriod({ poolDrawn: 10000 })
    expect(getPeriodStatus(period, NOW_IN_RANGE)).toBe('exhausted')
  })

  it('exhausted takes priority over active dates', () => {
    const period = createPeriod({ poolDrawn: 10000 })
    expect(getPeriodStatus(period, NOW_IN_RANGE)).toBe('exhausted')
  })
})

describe('getActivePeriod', () => {
  it('returns null when no periods exist', () => {
    expect(getActivePeriod([], NOW_IN_RANGE)).toBeNull()
  })

  it('returns the active period', () => {
    const period = createPeriod()
    expect(getActivePeriod([period], NOW_IN_RANGE)).toEqual(period)
  })

  it('returns null when all periods are outside date range', () => {
    const period = createPeriod()
    expect(getActivePeriod([period], NOW_BEFORE)).toBeNull()
  })
})

describe('calculateMatch', () => {
  const periods = [createPeriod()]

  it('calculates match for one-time donations', () => {
    const result = calculateMatch(100, periods, 'once', NOW_IN_RANGE)
    expect(result.matchedAmount).toBe(100) // 2x multiplier: 100 * (2-1) = 100
    expect(result.periodId).toBe('mp-1')
  })

  it('calculates match for monthly recurring donations', () => {
    const result = calculateMatch(50, periods, 'monthly', NOW_IN_RANGE)
    expect(result.matchedAmount).toBe(50) // 2x multiplier: 50 * (2-1) = 50
    expect(result.periodId).toBe('mp-1')
  })

  it('calculates match for yearly recurring donations', () => {
    const result = calculateMatch(200, periods, 'yearly', NOW_IN_RANGE)
    expect(result.matchedAmount).toBe(200) // 2x multiplier: 200 * (2-1) = 200
    expect(result.periodId).toBe('mp-1')
  })

  it('caps match by remaining pool', () => {
    const nearlyExhausted = [createPeriod({ poolDrawn: 9970 })]
    // Pool remaining = 30, match would be 100 * (2-1) = 100, capped to 30
    const result = calculateMatch(100, nearlyExhausted, 'once', NOW_IN_RANGE)
    expect(result.matchedAmount).toBe(30)
  })

  it('caps match by remaining pool for recurring too', () => {
    const nearlyExhausted = [createPeriod({ poolDrawn: 9980 })]
    // Pool remaining = 20, match would be 50 * (2-1) = 50, capped to 20
    const result = calculateMatch(50, nearlyExhausted, 'monthly', NOW_IN_RANGE)
    expect(result.matchedAmount).toBe(20)
  })

  it('returns 0 when no active period exists', () => {
    const result = calculateMatch(100, periods, 'once', NOW_BEFORE)
    expect(result.matchedAmount).toBe(0)
    expect(result.periodId).toBeUndefined()
  })

  it('returns 0 when no active period exists regardless of frequency', () => {
    expect(calculateMatch(100, periods, 'monthly', NOW_BEFORE).matchedAmount).toBe(0)
    expect(calculateMatch(100, periods, 'yearly', NOW_AFTER).matchedAmount).toBe(0)
  })

  it('returns 0 when pool is exhausted', () => {
    const exhausted = [createPeriod({ poolDrawn: 10000 })]
    expect(calculateMatch(100, exhausted, 'once', NOW_IN_RANGE).matchedAmount).toBe(0)
  })

  it('returns 0 when periods array is empty', () => {
    expect(calculateMatch(100, [], 'once', NOW_IN_RANGE).matchedAmount).toBe(0)
  })

  it('applies higher multipliers correctly', () => {
    const triple = [createPeriod({ matchMultiplier: 3 })]
    // 3x multiplier: 100 * (3-1) = 200
    const result = calculateMatch(100, triple, 'once', NOW_IN_RANGE)
    expect(result.matchedAmount).toBe(200)
  })

  it('defaults frequency to once when not provided', () => {
    const result = calculateMatch(100, periods, undefined as unknown as 'once', NOW_IN_RANGE)
    expect(result.matchedAmount).toBe(100)
  })
})
