import type { CampaignFundraiser } from '~/features/campaigns/shared/types'
import { computeFundraiserStats } from './api-sample-response-transactions'

/**
 * Sample fundraiser records (master table)
 *
 * Each fundraiser links to a parent P2P campaign and represents an individual's
 * fundraising page. In production this would be the `campaign_fundraisers` table.
 * Stats (raisedAmount, donationCount) are computed from the transactions table.
 *
 * Only Wild Amer's two fundraisers — all campaign IDs map to real entries in campaigns.ts.
 */
export const fundraisers: CampaignFundraiser[] = [
  {
    id: 'f1',
    campaignId: 'wild-amer-birthday-fundraiser',
    name: 'Wild Amer',
    email: 'awesome@charity.co.uk',
    joinedAt: '2025-11-15T00:00:00Z',
    ...computeFundraiserStats('wild-amer-birthday-fundraiser'),
    goal: 1000,
    slug: 'wild-amer-birthday',
    story:
      "I'm celebrating my birthday by raising funds for orangutan conservation! This is my personal campaign.",
    coverPhoto: '/imgs/baby-orangutan-hammick.webp',
    status: 'active',
    parentCampaignId: 'birthday-p2p-template'
  },
  {
    id: 'f3',
    campaignId: 'wild-amer-birthday-2-fundraiser',
    name: 'Wild Amer',
    email: 'awesome@charity.co.uk',
    joinedAt: '2025-12-20T00:00:00Z',
    ...computeFundraiserStats('wild-amer-birthday-2-fundraiser'),
    goal: 500,
    slug: 'wild-amer-birthday-2',
    story: 'Another fundraiser I created to support orangutans! Help me reach my goal.',
    status: 'active',
    parentCampaignId: 'birthday-p2p-template'
  }
]

/** Get fundraisers belonging to a parent P2P campaign */
export function getCampaignFundraisers(parentCampaignId: string): CampaignFundraiser[] {
  return fundraisers.filter((f) => f.parentCampaignId === parentCampaignId)
}
