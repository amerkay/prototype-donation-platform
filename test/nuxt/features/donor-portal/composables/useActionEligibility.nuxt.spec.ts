import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useDonorPortalSettingsStore } from '~/features/settings/admin/stores/donorPortalSettings'
import { useActionEligibility } from '~/features/donor-portal/composables/useActionEligibility'
import type { Transaction } from '~/features/donor-portal/types'
import type { Subscription } from '~/features/subscriptions/shared/types'

// Pin "now" so date arithmetic is deterministic
const NOW = new Date('2025-06-15T12:00:00Z').getTime()
const daysAgo = (n: number) => new Date(NOW - n * 86_400_000).toISOString()
const monthsAgo = (n: number) => new Date(NOW - n * 30.44 * 86_400_000).toISOString()

function makeTxn(overrides: Partial<Transaction> = {}): Transaction {
  return {
    id: 'txn_1',
    organizationId: 'org_1',
    processor: 'stripe',
    processorTransactionId: 'pi_1',
    type: 'subscription_payment',
    campaignId: 'camp_1',
    campaignName: 'Test Campaign',
    charityName: 'Test Charity',
    donorId: 'donor_1',
    donorName: 'Test Donor',
    donorEmail: 'donor@example.com',
    isAnonymous: false,
    giftAid: false,
    legalBasis: 'consent',
    status: 'succeeded',
    currency: 'GBP',
    baseCurrency: 'GBP',
    exchangeRate: 1,
    campaignCurrency: 'GBP',
    campaignExchangeRate: 1,
    subtotal: 50,
    coverCostsAmount: 0,
    totalAmount: 50,
    paymentMethod: { type: 'card', brand: 'visa', last4: '4242' },
    createdAt: daysAgo(5),
    matchedAmount: 0,
    lineItems: [],
    ...overrides
  }
}

function makeSub(overrides: Partial<Subscription> = {}): Subscription {
  return {
    id: 'sub_1',
    processor: 'stripe',
    processorSubscriptionId: 'sub_stripe_1',
    campaignId: 'camp_1',
    campaignName: 'Test Campaign',
    charityName: 'Test Charity',
    lineItems: [],
    subtotal: 50,
    coverCostsAmount: 0,
    totalAmount: 50,
    currency: 'GBP',
    baseCurrency: 'GBP',
    exchangeRate: 1,
    frequency: 'monthly',
    paymentMethod: { type: 'card', brand: 'visa', last4: '4242' },
    status: 'active',
    currentPeriodStart: monthsAgo(1),
    currentPeriodEnd: daysAgo(-29),
    totalPaid: 50,
    paymentCount: 6,
    createdAt: monthsAgo(6),
    ...overrides
  }
}

describe('useActionEligibility', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.useFakeTimers()
    vi.setSystemTime(NOW)
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  describe('refund window (standard)', () => {
    it('grants canRefund when transaction is within the refund window', () => {
      const store = useDonorPortalSettingsStore()
      store.$patch({
        refundStandard: {
          enabled: true,
          windowDays: 30,
          minDurationMonths: 0,
          minDonorValueLastYear: 0,
          disableWhenCampaignEnded: false
        }
      })

      const { checkEligibility } = useActionEligibility()
      const result = checkEligibility({
        transaction: makeTxn({ createdAt: daysAgo(29) }),
        donorValueLastYear: 0
      })

      expect(result.canRefund).toBe(true)
    })

    it('denies canRefund when transaction is outside the refund window', () => {
      const store = useDonorPortalSettingsStore()
      store.$patch({
        refundStandard: {
          enabled: true,
          windowDays: 30,
          minDurationMonths: 0,
          minDonorValueLastYear: 0,
          disableWhenCampaignEnded: false
        }
      })

      const { checkEligibility } = useActionEligibility()
      const result = checkEligibility({
        transaction: makeTxn({ createdAt: daysAgo(31) }),
        donorValueLastYear: 0
      })

      expect(result.canRefund).toBe(false)
    })

    it('grants canRefund at the exact window boundary (≤ not <)', () => {
      const store = useDonorPortalSettingsStore()
      store.$patch({
        refundStandard: {
          enabled: true,
          windowDays: 30,
          minDurationMonths: 0,
          minDonorValueLastYear: 0,
          disableWhenCampaignEnded: false
        }
      })

      const { checkEligibility } = useActionEligibility()
      const result = checkEligibility({
        transaction: makeTxn({ createdAt: daysAgo(30) }),
        donorValueLastYear: 0
      })

      expect(result.canRefund).toBe(true)
    })

    it('denies canRefund when the refund gate is disabled', () => {
      const store = useDonorPortalSettingsStore()
      store.$patch({
        refundStandard: {
          enabled: false,
          windowDays: 30,
          minDurationMonths: 0,
          minDonorValueLastYear: 0,
          disableWhenCampaignEnded: false
        }
      })

      const { checkEligibility } = useActionEligibility()
      const result = checkEligibility({
        transaction: makeTxn({ createdAt: daysAgo(5) }),
        donorValueLastYear: 0
      })

      expect(result.canRefund).toBe(false)
    })
  })

  describe('refund duration gate (subscription payments)', () => {
    it('denies canRefund when subscription is younger than minDurationMonths', () => {
      const store = useDonorPortalSettingsStore()
      store.$patch({
        refundStandard: {
          enabled: true,
          windowDays: 30,
          minDurationMonths: 3,
          minDonorValueLastYear: 0,
          disableWhenCampaignEnded: false
        }
      })

      const { checkEligibility } = useActionEligibility()
      const result = checkEligibility({
        transaction: makeTxn({ type: 'subscription_payment', createdAt: daysAgo(5) }),
        subscription: makeSub({ createdAt: monthsAgo(1) }),
        donorValueLastYear: 0
      })

      expect(result.canRefund).toBe(false)
    })

    it('grants canRefund when subscription meets minDurationMonths', () => {
      const store = useDonorPortalSettingsStore()
      store.$patch({
        refundStandard: {
          enabled: true,
          windowDays: 30,
          minDurationMonths: 3,
          minDonorValueLastYear: 0,
          disableWhenCampaignEnded: false
        }
      })

      const { checkEligibility } = useActionEligibility()
      const result = checkEligibility({
        transaction: makeTxn({ type: 'subscription_payment', createdAt: daysAgo(5) }),
        subscription: makeSub({ createdAt: monthsAgo(4) }),
        donorValueLastYear: 0
      })

      expect(result.canRefund).toBe(true)
    })

    it('skips duration check for one-time transactions', () => {
      const store = useDonorPortalSettingsStore()
      store.$patch({
        refundStandard: {
          enabled: true,
          windowDays: 30,
          minDurationMonths: 6,
          minDonorValueLastYear: 0,
          disableWhenCampaignEnded: false
        }
      })

      const { checkEligibility } = useActionEligibility()
      const result = checkEligibility({
        transaction: makeTxn({ type: 'one_time', createdAt: daysAgo(5) }),
        donorValueLastYear: 0
      })

      expect(result.canRefund).toBe(true)
    })
  })

  describe('donor value gate', () => {
    it('denies canRefund when donor value is below the minimum', () => {
      const store = useDonorPortalSettingsStore()
      store.$patch({
        refundStandard: {
          enabled: true,
          windowDays: 30,
          minDurationMonths: 0,
          minDonorValueLastYear: 100,
          disableWhenCampaignEnded: false
        }
      })

      const { checkEligibility } = useActionEligibility()
      const result = checkEligibility({
        transaction: makeTxn({ createdAt: daysAgo(5) }),
        donorValueLastYear: 50
      })

      expect(result.canRefund).toBe(false)
    })

    it('grants canRefund when donor value exactly meets the minimum', () => {
      const store = useDonorPortalSettingsStore()
      store.$patch({
        refundStandard: {
          enabled: true,
          windowDays: 30,
          minDurationMonths: 0,
          minDonorValueLastYear: 100,
          disableWhenCampaignEnded: false
        }
      })

      const { checkEligibility } = useActionEligibility()
      const result = checkEligibility({
        transaction: makeTxn({ createdAt: daysAgo(5) }),
        donorValueLastYear: 100
      })

      expect(result.canRefund).toBe(true)
    })
  })

  describe('no conditions = always eligible', () => {
    it('grants canRefund when all gates are at zero (open)', () => {
      const store = useDonorPortalSettingsStore()
      store.$patch({
        refundStandard: {
          enabled: true,
          windowDays: 30,
          minDurationMonths: 0,
          minDonorValueLastYear: 0,
          disableWhenCampaignEnded: false
        }
      })

      const { checkEligibility } = useActionEligibility()
      const result = checkEligibility({
        transaction: makeTxn({ createdAt: daysAgo(1) }),
        donorValueLastYear: 0
      })

      expect(result.canRefund).toBe(true)
    })
  })

  describe('subscription actions (pause / cancel / changeAmount)', () => {
    it('returns false for all subscription actions when no subscription is provided', () => {
      const store = useDonorPortalSettingsStore()
      store.$patch({
        pauseSubscription: { enabled: true, minDurationMonths: 0, minDonorValueLastYear: 0 },
        cancelSubscription: { enabled: true, minDurationMonths: 0, minDonorValueLastYear: 0 },
        changeAmount: { enabled: true, minDurationMonths: 0, minDonorValueLastYear: 0 }
      })

      const { checkEligibility } = useActionEligibility()
      const result = checkEligibility({ transaction: makeTxn(), donorValueLastYear: 0 })

      expect(result.canPause).toBe(false)
      expect(result.canCancel).toBe(false)
      expect(result.canChangeAmount).toBe(false)
    })

    it('denies canCancel when cancelSubscription gate is disabled', () => {
      const store = useDonorPortalSettingsStore()
      store.$patch({
        cancelSubscription: { enabled: false, minDurationMonths: 0, minDonorValueLastYear: 0 }
      })

      const { checkEligibility } = useActionEligibility()
      const result = checkEligibility({ subscription: makeSub(), donorValueLastYear: 0 })

      expect(result.canCancel).toBe(false)
    })

    it('grants canCancel when cancelSubscription gate is enabled with no restrictions', () => {
      const store = useDonorPortalSettingsStore()
      store.$patch({
        cancelSubscription: { enabled: true, minDurationMonths: 0, minDonorValueLastYear: 0 }
      })

      const { checkEligibility } = useActionEligibility()
      const result = checkEligibility({ subscription: makeSub(), donorValueLastYear: 0 })

      expect(result.canCancel).toBe(true)
    })

    it('denies canChangeAmount when subscription duration is below minimum', () => {
      const store = useDonorPortalSettingsStore()
      store.$patch({
        changeAmount: { enabled: true, minDurationMonths: 6, minDonorValueLastYear: 0 }
      })

      const { checkEligibility } = useActionEligibility()
      const result = checkEligibility({
        subscription: makeSub({ createdAt: monthsAgo(2) }),
        donorValueLastYear: 0
      })

      expect(result.canChangeAmount).toBe(false)
    })
  })

  describe('campaign-type-aware refund config resolution', () => {
    it('uses refundP2P config for p2p campaign type', () => {
      const store = useDonorPortalSettingsStore()
      store.$patch({
        refundStandard: {
          enabled: false,
          windowDays: 30,
          minDurationMonths: 0,
          minDonorValueLastYear: 0,
          disableWhenCampaignEnded: false
        },
        refundP2P: { enabled: true, windowDays: 60, disableWhenCampaignEnded: false }
      })

      const { checkEligibility } = useActionEligibility()
      const result = checkEligibility({
        transaction: makeTxn({ createdAt: daysAgo(5) }),
        donorValueLastYear: 0,
        campaignType: 'p2p'
      })

      // Standard is disabled but P2P is enabled → should use P2P
      expect(result.canRefund).toBe(true)
    })

    it('uses refundP2P config for event campaign type', () => {
      const store = useDonorPortalSettingsStore()
      store.$patch({
        refundStandard: {
          enabled: false,
          windowDays: 30,
          minDurationMonths: 0,
          minDonorValueLastYear: 0,
          disableWhenCampaignEnded: false
        },
        refundP2P: { enabled: true, windowDays: 60, disableWhenCampaignEnded: false }
      })

      const { checkEligibility } = useActionEligibility()
      const result = checkEligibility({
        transaction: makeTxn({ createdAt: daysAgo(5) }),
        donorValueLastYear: 0,
        campaignType: 'event'
      })

      expect(result.canRefund).toBe(true)
    })

    it('uses refundMatchedGiving config when isMatchedDonation is true (overrides P2P)', () => {
      const store = useDonorPortalSettingsStore()
      store.$patch({
        refundP2P: { enabled: true, windowDays: 60, disableWhenCampaignEnded: false },
        refundMatchedGiving: { enabled: false, windowDays: 30, disableWhenCampaignEnded: false }
      })

      const { checkEligibility } = useActionEligibility()
      const result = checkEligibility({
        transaction: makeTxn({ createdAt: daysAgo(5), matchedAmount: 100 }),
        donorValueLastYear: 0,
        campaignType: 'p2p',
        isMatchedDonation: true
      })

      // Matched giving override: disabled → canRefund false even though P2P is enabled
      expect(result.canRefund).toBe(false)
    })

    it('falls back to refundStandard when no campaign type specified', () => {
      const store = useDonorPortalSettingsStore()
      store.$patch({
        refundStandard: {
          enabled: true,
          windowDays: 90,
          minDurationMonths: 0,
          minDonorValueLastYear: 0,
          disableWhenCampaignEnded: false
        }
      })

      const { checkEligibility } = useActionEligibility()
      const result = checkEligibility({
        transaction: makeTxn({ createdAt: daysAgo(5) }),
        donorValueLastYear: 0
      })

      expect(result.canRefund).toBe(true)
    })
  })

  describe('disableWhenCampaignEnded', () => {
    it('blocks refund when campaign is completed and disableWhenCampaignEnded is true', () => {
      const store = useDonorPortalSettingsStore()
      store.$patch({
        refundStandard: {
          enabled: true,
          windowDays: 30,
          minDurationMonths: 0,
          minDonorValueLastYear: 0,
          disableWhenCampaignEnded: true
        }
      })

      const { checkEligibility } = useActionEligibility()
      const result = checkEligibility({
        transaction: makeTxn({ createdAt: daysAgo(5) }),
        donorValueLastYear: 0,
        campaignStatus: 'completed'
      })

      expect(result.canRefund).toBe(false)
    })

    it('blocks refund when campaign is ended and disableWhenCampaignEnded is true', () => {
      const store = useDonorPortalSettingsStore()
      store.$patch({
        refundStandard: {
          enabled: true,
          windowDays: 30,
          minDurationMonths: 0,
          minDonorValueLastYear: 0,
          disableWhenCampaignEnded: true
        }
      })

      const { checkEligibility } = useActionEligibility()
      const result = checkEligibility({
        transaction: makeTxn({ createdAt: daysAgo(5) }),
        donorValueLastYear: 0,
        campaignStatus: 'ended'
      })

      expect(result.canRefund).toBe(false)
    })

    it('allows refund when campaign is active even with disableWhenCampaignEnded true', () => {
      const store = useDonorPortalSettingsStore()
      store.$patch({
        refundStandard: {
          enabled: true,
          windowDays: 30,
          minDurationMonths: 0,
          minDonorValueLastYear: 0,
          disableWhenCampaignEnded: true
        }
      })

      const { checkEligibility } = useActionEligibility()
      const result = checkEligibility({
        transaction: makeTxn({ createdAt: daysAgo(5) }),
        donorValueLastYear: 0,
        campaignStatus: 'active'
      })

      expect(result.canRefund).toBe(true)
    })

    it('allows refund for ended campaign when disableWhenCampaignEnded is false', () => {
      const store = useDonorPortalSettingsStore()
      store.$patch({
        refundStandard: {
          enabled: true,
          windowDays: 30,
          minDurationMonths: 0,
          minDonorValueLastYear: 0,
          disableWhenCampaignEnded: false
        }
      })

      const { checkEligibility } = useActionEligibility()
      const result = checkEligibility({
        transaction: makeTxn({ createdAt: daysAgo(5) }),
        donorValueLastYear: 0,
        campaignStatus: 'ended'
      })

      expect(result.canRefund).toBe(true)
    })

    it('preserves canChangeAmount when campaign ended blocks refund', () => {
      const store = useDonorPortalSettingsStore()
      store.$patch({
        refundStandard: {
          enabled: true,
          windowDays: 30,
          minDurationMonths: 0,
          minDonorValueLastYear: 0,
          disableWhenCampaignEnded: true
        },
        changeAmount: { enabled: true, minDurationMonths: 0, minDonorValueLastYear: 0 }
      })

      const { checkEligibility } = useActionEligibility()
      const result = checkEligibility({
        transaction: makeTxn({ createdAt: daysAgo(5) }),
        subscription: makeSub(),
        donorValueLastYear: 0,
        campaignStatus: 'completed'
      })

      expect(result.canRefund).toBe(false)
      expect(result.canChangeAmount).toBe(true)
    })
  })
})
