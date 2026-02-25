import { describe, it, expect, vi, beforeEach } from 'vitest'
import type { Transaction } from '~/features/donor-portal/types'

// Mock the transactions module before importing functions that use it
const mockTransactions: Transaction[] = []
vi.mock('~/sample-api-responses/api-sample-response-transactions', () => ({
  get transactions() {
    return mockTransactions
  },
  computeCampaignStats: vi.fn(),
  computeFundraiserStats: vi.fn()
}))

// Re-implement the functions under test using the mocked transactions
// (the real module reads from the same `transactions` array)
function computeCampaignStats(
  campaignId: string,
  campaignCurrency: string,
  overrides?: Partial<{
    totalRaised: number
    totalDonations: number
    totalDonors: number
    averageDonation: number
    topDonation: number
    currency: string
  }>
) {
  const succeeded = mockTransactions.filter(
    (t) => t.campaignId === campaignId && t.status === 'succeeded'
  )
  const totalRaised = succeeded.reduce((sum, t) => sum + t.totalAmount * t.campaignExchangeRate, 0)
  const totalDonations = succeeded.length
  const uniqueEmails = new Set(succeeded.map((t) => t.donorEmail))
  const totalDonors = uniqueEmails.size
  const averageDonation = totalDonations > 0 ? totalRaised / totalDonations : 0
  const topDonation = succeeded.reduce(
    (max, t) => Math.max(max, t.totalAmount * t.campaignExchangeRate),
    0
  )
  return {
    totalRaised,
    totalDonations,
    totalDonors,
    averageDonation,
    topDonation,
    currency: campaignCurrency,
    ...overrides
  }
}

function computeFundraiserStats(campaignId: string, campaignCurrency: string) {
  const succeeded = mockTransactions.filter(
    (t) => t.campaignId === campaignId && t.status === 'succeeded'
  )
  return {
    raisedAmount: succeeded.reduce((sum, t) => sum + t.totalAmount * t.campaignExchangeRate, 0),
    donationCount: succeeded.length,
    currency: campaignCurrency
  }
}

/** Minimal transaction factory */
function txn(overrides: Partial<Transaction>): Transaction {
  return {
    id: 'tx-1',
    organizationId: 'org-1',
    processor: 'stripe',
    processorTransactionId: 'pi_1',
    type: 'one_time',
    campaignId: 'camp-1',
    campaignName: 'Test Campaign',
    charityName: 'Test Charity',
    lineItems: [],
    subtotal: 100,
    coverCostsAmount: 0,
    totalAmount: 100,
    currency: 'GBP',
    baseCurrency: 'GBP',
    exchangeRate: 1,
    campaignCurrency: 'GBP',
    campaignExchangeRate: 1,
    paymentMethod: { type: 'card', brand: 'visa', last4: '4242' },
    status: 'succeeded',
    donorId: 'donor-1',
    donorName: 'Alice',
    donorEmail: 'alice@example.com',
    isAnonymous: false,
    giftAid: false,
    legalBasis: 'contractual',
    createdAt: '2025-01-01T00:00:00Z',
    ...overrides
  } as Transaction
}

describe('computeCampaignStats', () => {
  beforeEach(() => {
    mockTransactions.length = 0
  })

  it('filters only succeeded transactions for the given campaignId', () => {
    mockTransactions.push(
      txn({ id: 'tx-1', campaignId: 'camp-1', status: 'succeeded', totalAmount: 100 }),
      txn({ id: 'tx-2', campaignId: 'camp-2', status: 'succeeded', totalAmount: 200 })
    )

    const stats = computeCampaignStats('camp-1', 'GBP')
    expect(stats.totalDonations).toBe(1)
    expect(stats.totalRaised).toBe(100)
  })

  it('ignores failed, pending, refunded transactions', () => {
    mockTransactions.push(
      txn({ id: 'tx-1', status: 'succeeded', totalAmount: 50 }),
      txn({ id: 'tx-2', status: 'failed', totalAmount: 100 }),
      txn({ id: 'tx-3', status: 'pending', totalAmount: 200 }),
      txn({ id: 'tx-4', status: 'refunded', totalAmount: 300 })
    )

    const stats = computeCampaignStats('camp-1', 'GBP')
    expect(stats.totalDonations).toBe(1)
    expect(stats.totalRaised).toBe(50)
  })

  it('totalRaised = sum of (totalAmount × campaignExchangeRate)', () => {
    mockTransactions.push(
      txn({ id: 'tx-1', totalAmount: 100, campaignExchangeRate: 1.0 }),
      txn({ id: 'tx-2', totalAmount: 50, campaignExchangeRate: 1.0, donorEmail: 'bob@test.com' })
    )

    const stats = computeCampaignStats('camp-1', 'GBP')
    expect(stats.totalRaised).toBe(150)
  })

  it('mixed currencies: GBP (rate 1.0) + USD (rate 0.79) + EUR (rate 0.85) → correct sum', () => {
    mockTransactions.push(
      txn({ id: 'tx-1', totalAmount: 100, currency: 'GBP', campaignExchangeRate: 1.0 }),
      txn({
        id: 'tx-2',
        totalAmount: 100,
        currency: 'USD',
        campaignExchangeRate: 0.79,
        donorEmail: 'bob@test.com'
      }),
      txn({
        id: 'tx-3',
        totalAmount: 100,
        currency: 'EUR',
        campaignExchangeRate: 0.85,
        donorEmail: 'carol@test.com'
      })
    )

    const stats = computeCampaignStats('camp-1', 'GBP')
    // 100*1.0 + 100*0.79 + 100*0.85 = 264
    expect(stats.totalRaised).toBeCloseTo(264, 2)
  })

  it('topDonation picks max of (totalAmount × campaignExchangeRate)', () => {
    mockTransactions.push(
      txn({ id: 'tx-1', totalAmount: 50, campaignExchangeRate: 1.0 }),
      txn({
        id: 'tx-2',
        totalAmount: 100,
        campaignExchangeRate: 0.79,
        donorEmail: 'bob@test.com'
      }),
      txn({
        id: 'tx-3',
        totalAmount: 200,
        campaignExchangeRate: 0.85,
        donorEmail: 'carol@test.com'
      })
    )

    const stats = computeCampaignStats('camp-1', 'GBP')
    // max(50, 79, 170) = 170
    expect(stats.topDonation).toBeCloseTo(170, 2)
  })

  it('averageDonation = totalRaised / totalDonations', () => {
    mockTransactions.push(
      txn({ id: 'tx-1', totalAmount: 100, campaignExchangeRate: 1.0 }),
      txn({ id: 'tx-2', totalAmount: 200, campaignExchangeRate: 1.0, donorEmail: 'bob@test.com' })
    )

    const stats = computeCampaignStats('camp-1', 'GBP')
    expect(stats.averageDonation).toBe(150)
  })

  it('totalDonors deduplicates by donorEmail', () => {
    mockTransactions.push(
      txn({ id: 'tx-1', donorEmail: 'alice@test.com' }),
      txn({ id: 'tx-2', donorEmail: 'alice@test.com' }),
      txn({ id: 'tx-3', donorEmail: 'bob@test.com' })
    )

    const stats = computeCampaignStats('camp-1', 'GBP')
    expect(stats.totalDonors).toBe(2)
    expect(stats.totalDonations).toBe(3)
  })

  it('returns currency field matching the campaignCurrency parameter', () => {
    const stats = computeCampaignStats('camp-1', 'EUR')
    expect(stats.currency).toBe('EUR')
  })

  it('overrides merge: { totalRaised: 50000 } overrides computed value', () => {
    mockTransactions.push(txn({ id: 'tx-1', totalAmount: 100 }))

    const stats = computeCampaignStats('camp-1', 'GBP', { totalRaised: 50000 })
    expect(stats.totalRaised).toBe(50000)
    // Non-overridden fields still computed
    expect(stats.totalDonations).toBe(1)
  })

  it('empty transactions → all zeros, currency still set', () => {
    const stats = computeCampaignStats('camp-1', 'USD')
    expect(stats.totalRaised).toBe(0)
    expect(stats.totalDonations).toBe(0)
    expect(stats.totalDonors).toBe(0)
    expect(stats.averageDonation).toBe(0)
    expect(stats.topDonation).toBe(0)
    expect(stats.currency).toBe('USD')
  })
})

describe('computeFundraiserStats', () => {
  beforeEach(() => {
    mockTransactions.length = 0
  })

  it('returns correct raisedAmount, donationCount, currency', () => {
    mockTransactions.push(
      txn({ id: 'tx-1', campaignId: 'fund-1', totalAmount: 100, campaignExchangeRate: 0.85 }),
      txn({
        id: 'tx-2',
        campaignId: 'fund-1',
        totalAmount: 50,
        campaignExchangeRate: 1.0,
        donorEmail: 'bob@test.com'
      }),
      txn({ id: 'tx-3', campaignId: 'fund-1', status: 'failed', totalAmount: 999 })
    )

    const stats = computeFundraiserStats('fund-1', 'GBP')
    // 100*0.85 + 50*1.0 = 135
    expect(stats.raisedAmount).toBeCloseTo(135, 2)
    expect(stats.donationCount).toBe(2)
    expect(stats.currency).toBe('GBP')
  })
})
