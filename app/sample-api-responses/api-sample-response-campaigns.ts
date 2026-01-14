import type { Campaign } from '~/features/campaigns/types'

export const campaigns: Campaign[] = [
  {
    id: 'adopt-orangutan',
    name: 'Adopt an Orangutan',
    status: 'active',
    createdAt: '2025-01-01T00:00:00Z',
    updatedAt: '2026-01-14T10:30:00Z',
    stats: {
      totalRaised: 45820.5,
      totalDonations: 342,
      totalDonors: 287,
      goalAmount: 50000,
      includeGiftAidInGoal: true,
      averageDonation: 134,
      topDonation: 1000,
      daysRemaining: 45
    },
    crowdfunding: {
      enabled: true,
      coverPhoto: '/imgs/orangutan-cover.jpg',
      title: 'Help Save Borneo Orangutans',
      shortDescription:
        'Support the rehabilitation and protection of endangered orangutans in their natural habitat.',
      story: `Our orangutan adoption program provides critical care for orphaned and injured orangutans. Each adoption helps fund veterinary care, nutritious food, and habitat restoration.\n\nWith your support, we've successfully rehabilitated and released 47 orangutans back into protected forest areas this year. Every contribution makes a real difference in saving these incredible creatures from extinction.\n\nJoin us in protecting one of our closest living relatives and preserving the biodiversity of Borneo's rainforests for future generations.`,
      showProgressBar: true,
      showRecentDonations: true,
      defaultDonationsView: 'recent',
      numberOfDonationsToShow: 10,
      allowPeerToPeerFundraising: true,
      wordpressPluginEnabled: true
    },
    charity: {
      name: 'Borneo Orangutan Survival Foundation',
      registrationNumber: 'RCN123456',
      website: 'https://orangutan.org',
      description:
        'We rescue, rehabilitate, and release orangutans while protecting their natural habitat through community engagement and sustainable forest management programs across Borneo and Sumatra.'
    },
    socialSharing: {
      facebook: true,
      twitter: true,
      linkedin: true,
      whatsapp: true,
      email: true,
      copyLink: true
    },
    fundraisers: [
      {
        id: 'f1',
        name: 'Sarah Johnson',
        email: 'sarah@example.com',
        type: 'individual',
        joinedAt: '2025-06-15T00:00:00Z',
        raisedAmount: 5420,
        donationCount: 23
      },
      {
        id: 'f2',
        name: 'Green Team Initiative',
        email: 'team@greenteam.org',
        type: 'team',
        joinedAt: '2025-08-01T00:00:00Z',
        raisedAmount: 12350,
        donationCount: 67
      }
    ]
  }
]
