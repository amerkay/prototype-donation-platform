import type { CampaignFundraiser } from '~/features/campaigns/shared/types'
import { computeFundraiserStats } from './api-sample-response-transactions'

/**
 * Sample fundraiser records (master table)
 *
 * Each fundraiser links to a parent P2P campaign and represents an individual's
 * fundraising page. In production this would be the `campaign_fundraisers` table.
 * Stats (raisedAmount, donationCount) are computed from the transactions table.
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
    id: 'f2',
    campaignId: 'michael-chen-birthday-fundraiser',
    name: 'Michael Chen',
    email: 'michael@example.com',
    joinedAt: '2025-12-01T00:00:00Z',
    ...computeFundraiserStats('michael-chen-birthday-fundraiser'),
    goal: 500,
    slug: 'michael-chen-birthday',
    story: 'Turning 25 and want to make it count! Please help me reach my goal.',
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
  },
  {
    id: 'f4',
    campaignId: 'david-martinez-birthday-fundraiser',
    name: 'David Martinez',
    email: 'david@example.com',
    joinedAt: '2026-01-05T00:00:00Z',
    ...computeFundraiserStats('david-martinez-birthday-fundraiser'),
    goal: 500,
    slug: 'david-martinez-birthday',
    story: 'My 40th is coming up - donate to save orangutans!',
    status: 'active',
    parentCampaignId: 'birthday-p2p-template'
  },
  {
    id: 'f5',
    campaignId: 'lisa-anderson-birthday-fundraiser',
    name: 'Lisa Anderson',
    email: 'lisa@example.com',
    joinedAt: '2025-11-28T00:00:00Z',
    ...computeFundraiserStats('lisa-anderson-birthday-fundraiser'),
    goal: 500,
    slug: 'lisa-anderson-birthday',
    story: 'Small goal, big impact! Help me celebrate sustainably.',
    status: 'paused',
    parentCampaignId: 'birthday-p2p-template'
  }
]

/** Get fundraisers belonging to a parent P2P campaign */
export function getCampaignFundraisers(parentCampaignId: string): CampaignFundraiser[] {
  return fundraisers.filter((f) => f.parentCampaignId === parentCampaignId)
}
