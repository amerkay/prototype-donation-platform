import type { Campaign } from '~/features/campaigns/shared/types'
import { adoptOrangutanForms } from './api-sample-response-forms'

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
      averageDonation: 134,
      topDonation: 1000,
      daysRemaining: 45
    },
    crowdfunding: {
      enabled: true,
      coverPhoto: '/imgs/baby-orangutan-hammick.webp',
      title: 'Help Save Borneo Orangutans',
      shortDescription:
        'Support the rehabilitation and protection of endangered orangutans in their natural habitat.',
      story: `Our orangutan adoption program provides critical care for orphaned and injured orangutans. Each adoption helps fund veterinary care, nutritious food, and habitat restoration.\n\nWith your support, we've successfully rehabilitated and released 47 orangutans back into protected forest areas this year. Every contribution makes a real difference in saving these incredible creatures from extinction.\n\nJoin us in protecting one of our closest living relatives and preserving the biodiversity of Borneo's rainforests for future generations.`,
      showProgressBar: true,
      showRecentDonations: true,
      defaultDonationsView: 'recent',
      numberOfDonationsToShow: 5,
      goalAmount: 50000
    },
    peerToPeer: {
      enabled: true,
      allowIndividuals: true,
      allowTeams: true,
      fundraiserGoalDefault: 500,
      customMessage: 'Join our community of fundraisers and help us save orangutans!'
    },
    charity: {
      name: 'Borneo Orangutan Survival Foundation',
      registrationNumber: 'RCN123456',
      website: 'https://orangutan.org',
      description:
        'We rescue, rehabilitate, and release orangutans while protecting their natural habitat through community engagement and sustainable forest management programs across Borneo and Sumatra.'
    },
    socialSharing: {
      enabled: true,
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
    ],
    recentDonations: [
      {
        id: 'd1',
        donorName: 'Emma Wilson',
        amount: 250,
        message: 'Keep up the amazing work saving these beautiful creatures!',
        isAnonymous: false,
        createdAt: '2026-01-14T09:30:00Z'
      },
      {
        id: 'd2',
        donorName: 'Anonymous',
        amount: 100,
        isAnonymous: true,
        createdAt: '2026-01-14T08:15:00Z'
      },
      {
        id: 'd3',
        donorName: 'James Chen',
        amount: 500,
        message: 'In memory of my grandmother who loved orangutans.',
        isAnonymous: false,
        createdAt: '2026-01-13T22:45:00Z'
      },
      {
        id: 'd4',
        donorName: 'Sarah & Tom',
        amount: 75,
        message: 'Happy to support!',
        isAnonymous: false,
        createdAt: '2026-01-13T18:30:00Z'
      },
      {
        id: 'd5',
        donorName: 'Anonymous',
        amount: 1000,
        isAnonymous: true,
        createdAt: '2026-01-13T14:20:00Z'
      },
      {
        id: 'd6',
        donorName: 'Maria Garcia',
        amount: 50,
        message: 'For Bumi!',
        isAnonymous: false,
        createdAt: '2026-01-13T11:00:00Z'
      },
      {
        id: 'd7',
        donorName: 'David Brown',
        amount: 150,
        isAnonymous: false,
        createdAt: '2026-01-12T16:45:00Z'
      },
      {
        id: 'd8',
        donorName: 'Anonymous',
        amount: 25,
        isAnonymous: true,
        createdAt: '2026-01-12T10:30:00Z'
      },
      {
        id: 'd9',
        donorName: 'Lisa Thompson',
        amount: 200,
        message: 'Monthly supporter - love seeing the progress updates!',
        isAnonymous: false,
        createdAt: '2026-01-11T19:15:00Z'
      },
      {
        id: 'd10',
        donorName: 'Michael Lee',
        amount: 300,
        message: 'Donated on behalf of my company.',
        isAnonymous: false,
        createdAt: '2026-01-11T09:00:00Z'
      }
    ],
    forms: adoptOrangutanForms
  }
]
