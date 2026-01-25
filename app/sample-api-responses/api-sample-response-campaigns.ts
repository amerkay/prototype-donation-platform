import type { Campaign } from '~/features/campaigns/shared/types'
import {
  adoptOrangutanForms,
  oceanConservationForms,
  emergencyReliefForms
} from './api-sample-response-forms'

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
  },
  {
    id: 'ocean-conservation',
    name: 'Ocean Conservation Project',
    status: 'active',
    createdAt: '2025-03-15T00:00:00Z',
    updatedAt: '2026-01-14T08:00:00Z',
    stats: {
      totalRaised: 28500,
      totalDonations: 156,
      totalDonors: 124,
      averageDonation: 183,
      topDonation: 2000,
      daysRemaining: 30
    },
    crowdfunding: {
      enabled: true,
      title: 'Save Our Oceans',
      shortDescription: 'Help protect marine life and ocean ecosystems.',
      story:
        'Our ocean conservation efforts focus on protecting coral reefs, reducing plastic pollution, and supporting sustainable fishing practices.',
      showProgressBar: true,
      showRecentDonations: true,
      defaultDonationsView: 'top',
      numberOfDonationsToShow: 10,
      goalAmount: 40000
    },
    peerToPeer: {
      enabled: false,
      allowIndividuals: false,
      allowTeams: false
    },
    charity: {
      name: 'Ocean Conservation Foundation',
      registrationNumber: 'RCN789012',
      website: 'https://oceanconservation.org',
      description: 'Dedicated to protecting and restoring ocean ecosystems worldwide.'
    },
    socialSharing: {
      facebook: true,
      twitter: true,
      linkedin: false,
      whatsapp: true,
      email: true,
      copyLink: true
    },
    fundraisers: [],
    recentDonations: [
      {
        id: 'od1',
        donorName: 'Ocean Lover',
        amount: 2000,
        message: 'For the whales!',
        isAnonymous: false,
        createdAt: '2026-01-12T10:00:00Z'
      },
      {
        id: 'od2',
        donorName: 'Anonymous',
        amount: 500,
        isAnonymous: true,
        createdAt: '2026-01-10T15:30:00Z'
      }
    ],
    forms: oceanConservationForms
  },
  {
    id: 'emergency-relief',
    name: 'Emergency Relief Fund',
    status: 'active',
    createdAt: '2025-06-01T00:00:00Z',
    updatedAt: '2026-01-14T12:00:00Z',
    stats: {
      totalRaised: 67200,
      totalDonations: 523,
      totalDonors: 412,
      averageDonation: 129,
      topDonation: 5000,
      daysRemaining: 15
    },
    crowdfunding: {
      enabled: true,
      title: 'Emergency Relief - Help Now',
      shortDescription: 'Provide immediate aid to communities affected by natural disasters.',
      story:
        'Your donation provides emergency shelter, food, clean water, and medical supplies to families in crisis.',
      showProgressBar: true,
      showRecentDonations: true,
      defaultDonationsView: 'recent',
      numberOfDonationsToShow: 20,
      goalAmount: 100000
    },
    peerToPeer: {
      enabled: true,
      allowIndividuals: true,
      allowTeams: false,
      fundraiserGoalDefault: 1000
    },
    charity: {
      name: 'Global Relief Network',
      registrationNumber: 'RCN345678',
      website: 'https://globalrelief.org',
      description: 'Rapid response humanitarian aid organization.'
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
        id: 'rf1',
        name: 'Community Heroes',
        email: 'heroes@community.org',
        type: 'individual',
        joinedAt: '2025-11-01T00:00:00Z',
        raisedAmount: 8500,
        donationCount: 45
      }
    ],
    recentDonations: [
      {
        id: 'rd1',
        donorName: 'Corporate Donor',
        amount: 5000,
        message: 'From our entire team',
        isAnonymous: false,
        createdAt: '2026-01-13T14:00:00Z'
      },
      {
        id: 'rd2',
        donorName: 'Anonymous',
        amount: 250,
        isAnonymous: true,
        createdAt: '2026-01-13T10:00:00Z'
      }
    ],
    forms: emergencyReliefForms
  }
]
