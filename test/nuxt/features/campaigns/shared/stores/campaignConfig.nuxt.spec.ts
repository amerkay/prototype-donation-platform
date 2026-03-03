import { describe, it, expect, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useCampaignConfigStore } from '~/features/campaigns/shared/stores/campaignConfig'
import type {
  Campaign,
  CampaignType,
  CampaignStats,
  CrowdfundingSettings,
  PeerToPeerSettings
} from '~/features/campaigns/shared/types'

/** Minimal campaign factory */
function makeCampaign(overrides: Partial<Campaign> = {}): Campaign {
  const defaultStats: CampaignStats = {
    totalRaised: 0,
    totalDonations: 0,
    totalDonors: 0,
    averageDonation: 0,
    topDonation: 0,
    currency: 'GBP'
  }
  const defaultCrowdfunding: CrowdfundingSettings = {
    enabled: true,
    currency: 'GBP',
    title: 'Test Campaign',
    shortDescription: 'Test description',
    showProgressBar: true,
    showRecentDonations: true,
    defaultDonationsView: 'recent',
    numberOfDonationsToShow: 5,
    enableSocialSharing: true
  }
  const defaultP2P: PeerToPeerSettings = { enabled: false }

  return {
    id: 'camp-1',
    type: 'standard',
    name: 'Test Campaign',
    status: 'draft',
    isArchived: false,
    createdAt: '2025-01-01T00:00:00Z',
    updatedAt: '2025-01-01T00:00:00Z',
    stats: defaultStats,
    crowdfunding: defaultCrowdfunding,
    peerToPeer: defaultP2P,
    matchedGiving: { periods: [] },
    fundraisers: [],
    recentDonations: [],
    form: null,
    ...overrides
  } as Campaign
}

describe('Campaign Config Store', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  describe('currency getter/setter', () => {
    it('returns crowdfunding.currency when set', () => {
      const store = useCampaignConfigStore()
      store.crowdfunding = { currency: 'EUR' } as CrowdfundingSettings
      expect(store.currency).toBe('EUR')
    })

    it('returns empty string when crowdfunding is null', () => {
      const store = useCampaignConfigStore()
      expect(store.crowdfunding).toBeNull()
      expect(store.currency).toBe('')
    })

    it('allows setting currency when id is null (new campaign)', () => {
      const store = useCampaignConfigStore()
      store.crowdfunding = { currency: '' } as CrowdfundingSettings
      expect(store.id).toBeNull()

      store.currency = 'USD'
      expect(store.currency).toBe('USD')
    })

    it('allows setting currency when crowdfunding.currency is empty string', () => {
      const store = useCampaignConfigStore()
      store.id = 'camp-1'
      store.crowdfunding = { currency: '' } as CrowdfundingSettings

      store.currency = 'EUR'
      expect(store.currency).toBe('EUR')
    })

    it('silently ignores currency set when id exists AND currency is already set', () => {
      const store = useCampaignConfigStore()
      store.id = 'camp-1'
      store.crowdfunding = { currency: 'GBP' } as CrowdfundingSettings

      store.currency = 'USD'
      expect(store.currency).toBe('GBP')
    })

    it.each<CampaignType>(['standard', 'p2p', 'p2p-fundraiser'])(
      'immutability applies to %s campaigns',
      (campaignType: CampaignType) => {
        const store = useCampaignConfigStore()
        store.initialize(makeCampaign({ type: campaignType, id: 'camp-1' }))

        store.currency = 'USD'
        expect(store.currency).toBe('GBP') // original value preserved
      }
    )
  })

  describe('initialize and reset', () => {
    it('initialize populates currency from campaign crowdfunding data', () => {
      const store = useCampaignConfigStore()
      store.initialize(
        makeCampaign({
          crowdfunding: {
            currency: 'EUR'
          } as CrowdfundingSettings
        })
      )
      expect(store.currency).toBe('EUR')
      expect(store.id).toBe('camp-1')
    })

    it('reset clears currency (crowdfunding becomes null)', () => {
      const store = useCampaignConfigStore()
      store.initialize(makeCampaign())
      expect(store.currency).toBe('GBP')

      store.reset()
      expect(store.crowdfunding).toBeNull()
      expect(store.currency).toBe('')
    })
  })

  describe('hasMatchedGiving', () => {
    it('returns false when no match periods exist', () => {
      const store = useCampaignConfigStore()
      store.initialize(makeCampaign())
      expect(store.hasMatchedGiving).toBe(false)
    })

    it('returns true when match periods exist (regardless of campaign type)', () => {
      const store = useCampaignConfigStore()
      store.initialize(
        makeCampaign({
          type: 'standard',
          matchedGiving: {
            periods: [
              {
                id: 'mp-1',
                name: 'Test Match',
                matchMultiplier: 2,
                poolAmount: 10000,
                poolDrawn: 0,
                startDate: '2026-01-01T00:00:00Z',
                endDate: '2026-12-31T00:00:00Z'
              }
            ]
          }
        })
      )
      expect(store.hasMatchedGiving).toBe(true)
    })

    it('matchedTotal includes pool drawn when matching is active', () => {
      const store = useCampaignConfigStore()
      store.initialize(
        makeCampaign({
          type: 'standard',
          stats: {
            totalRaised: 5000,
            totalDonations: 50,
            totalDonors: 40,
            averageDonation: 100,
            topDonation: 500,
            currency: 'GBP'
          },
          matchedGiving: {
            periods: [
              {
                id: 'mp-1',
                name: 'Test Match',
                matchMultiplier: 2,
                poolAmount: 10000,
                poolDrawn: 3000,
                startDate: '2026-01-01T00:00:00Z',
                endDate: '2026-12-31T00:00:00Z'
              }
            ]
          }
        })
      )
      expect(store.matchedTotal).toBe(8000) // 5000 raised + 3000 matched
    })
  })

  describe('progressPercentage', () => {
    it('computes correctly (totalRaised / goalAmount × 100, capped at 100)', () => {
      const store = useCampaignConfigStore()
      store.initialize(
        makeCampaign({
          crowdfunding: {
            enabled: true,
            currency: 'GBP',
            goalAmount: 1000,
            title: 'T',
            shortDescription: 'D',
            showProgressBar: true,
            showRecentDonations: true,
            defaultDonationsView: 'recent',
            numberOfDonationsToShow: 5,
            enableSocialSharing: true
          },
          stats: {
            totalRaised: 750,
            totalDonations: 10,
            totalDonors: 8,
            averageDonation: 75,
            topDonation: 200,
            currency: 'GBP'
          }
        })
      )

      expect(store.progressPercentage).toBe(75)
    })

    it('caps at 100 when totalRaised exceeds goalAmount', () => {
      const store = useCampaignConfigStore()
      store.initialize(
        makeCampaign({
          crowdfunding: {
            enabled: true,
            currency: 'GBP',
            goalAmount: 100,
            title: 'T',
            shortDescription: 'D',
            showProgressBar: true,
            showRecentDonations: true,
            defaultDonationsView: 'recent',
            numberOfDonationsToShow: 5,
            enableSocialSharing: true
          },
          stats: {
            totalRaised: 200,
            totalDonations: 2,
            totalDonors: 2,
            averageDonation: 100,
            topDonation: 100,
            currency: 'GBP'
          }
        })
      )

      expect(store.progressPercentage).toBe(100)
    })
  })

  describe('remainingAmount', () => {
    it('equals goalAmount - totalRaised, floored at 0', () => {
      const store = useCampaignConfigStore()
      store.initialize(
        makeCampaign({
          crowdfunding: {
            enabled: true,
            currency: 'GBP',
            goalAmount: 1000,
            title: 'T',
            shortDescription: 'D',
            showProgressBar: true,
            showRecentDonations: true,
            defaultDonationsView: 'recent',
            numberOfDonationsToShow: 5,
            enableSocialSharing: true
          },
          stats: {
            totalRaised: 300,
            totalDonations: 3,
            totalDonors: 3,
            averageDonation: 100,
            topDonation: 100,
            currency: 'GBP'
          }
        })
      )

      expect(store.remainingAmount).toBe(700)
    })

    it('floors at 0 when totalRaised exceeds goalAmount', () => {
      const store = useCampaignConfigStore()
      store.initialize(
        makeCampaign({
          crowdfunding: {
            enabled: true,
            currency: 'GBP',
            goalAmount: 100,
            title: 'T',
            shortDescription: 'D',
            showProgressBar: true,
            showRecentDonations: true,
            defaultDonationsView: 'recent',
            numberOfDonationsToShow: 5,
            enableSocialSharing: true
          },
          stats: {
            totalRaised: 500,
            totalDonations: 5,
            totalDonors: 5,
            averageDonation: 100,
            topDonation: 100,
            currency: 'GBP'
          }
        })
      )

      expect(store.remainingAmount).toBe(0)
    })
  })
})
