import type { Campaign } from '~/features/campaigns/shared/types'
import {
  adoptOrangutanForms,
  birthdayP2PForms,
  wildAmer1FundraiserForms,
  wildAmer2FundraiserForms
} from './api-sample-response-forms'

export const campaigns: Campaign[] = [
  {
    id: 'adopt-orangutan',
    type: 'standard',
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
      enabled: false
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
    fundraisers: [],
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
    id: 'birthday-p2p-template',
    type: 'p2p',
    p2pPreset: 'birthday',
    name: 'Birthday Fundraiser Template',
    status: 'active',
    createdAt: '2025-11-01T00:00:00Z',
    updatedAt: '2026-01-10T14:00:00Z',
    stats: {
      totalRaised: 12450,
      totalDonations: 89,
      totalDonors: 76,
      averageDonation: 140,
      topDonation: 500
    },
    crowdfunding: {
      enabled: true,
      title: 'Help Me Celebrate by Giving Back',
      shortDescription:
        "Instead of birthday gifts, I'm asking friends and family to support a cause close to my heart.",
      story:
        "This year, I'm turning my birthday into an opportunity to make a difference. Instead of presents, I'd love for you to donate to this cause that means so much to me.\n\nEvery contribution, no matter how small, helps us get closer to our goal. Thank you for celebrating with me!",
      showProgressBar: true,
      showRecentDonations: true,
      defaultDonationsView: 'recent',
      numberOfDonationsToShow: 5,
      goalAmount: 500
    },
    peerToPeer: {
      enabled: true,
      customMessage: 'Join me in celebrating by raising funds for a great cause!'
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
      linkedin: false,
      whatsapp: true,
      email: true,
      copyLink: true
    },
    fundraisers: [
      {
        id: 'f1',
        campaignId: 'wild-amer-birthday-fundraiser',
        name: 'Wild Amer',
        email: 'awesome@charity.co.uk',
        joinedAt: '2025-11-15T00:00:00Z',
        raisedAmount: 420,
        donationCount: 23,
        goal: 1000,
        slug: 'wild-amer-birthday',
        story:
          "I'm celebrating my birthday by raising funds for orangutan conservation! This is my personal campaign.",
        coverPhoto: '/imgs/baby-orangutan-hammick.webp',
        status: 'active'
      },
      {
        id: 'f2',
        campaignId: 'michael-chen-birthday-fundraiser',
        name: 'Michael Chen',
        email: 'michael@example.com',
        joinedAt: '2025-12-01T00:00:00Z',
        raisedAmount: 385,
        donationCount: 18,
        goal: 500,
        slug: 'michael-chen-birthday',
        story: 'Turning 25 and want to make it count! Please help me reach my goal.',
        status: 'active'
      },
      {
        id: 'f3',
        campaignId: 'wild-amer-birthday-2-fundraiser',
        name: 'Wild Amer',
        email: 'awesome@charity.co.uk',
        joinedAt: '2025-12-20T00:00:00Z',
        raisedAmount: 180,
        donationCount: 12,
        goal: 500,
        slug: 'wild-amer-birthday-2',
        story: 'Another fundraiser I created to support orangutans! Help me reach my goal.',
        status: 'active'
      },
      {
        id: 'f4',
        campaignId: 'david-martinez-birthday-fundraiser',
        name: 'David Martinez',
        email: 'david@example.com',
        joinedAt: '2026-01-05T00:00:00Z',
        raisedAmount: 85,
        donationCount: 8,
        goal: 500,
        slug: 'david-martinez-birthday',
        story: 'My 40th is coming up - donate to save orangutans!',
        status: 'active'
      },
      {
        id: 'f5',
        campaignId: 'lisa-anderson-birthday-fundraiser',
        name: 'Lisa Anderson',
        email: 'lisa@example.com',
        joinedAt: '2025-11-28T00:00:00Z',
        raisedAmount: 75,
        donationCount: 6,
        goal: 500,
        slug: 'lisa-anderson-birthday',
        story: 'Small goal, big impact! Help me celebrate sustainably.',
        status: 'paused'
      }
    ],
    recentDonations: [
      {
        id: 'pd1',
        donorName: 'John Smith',
        amount: 100,
        message: 'Happy Birthday Sarah!',
        isAnonymous: false,
        createdAt: '2026-01-10T12:30:00Z'
      },
      {
        id: 'pd2',
        donorName: 'Anonymous',
        amount: 50,
        isAnonymous: true,
        createdAt: '2026-01-10T10:15:00Z'
      },
      {
        id: 'pd3',
        donorName: 'Rachel Green',
        amount: 75,
        message: 'Great cause!',
        isAnonymous: false,
        createdAt: '2026-01-09T18:20:00Z'
      }
    ],
    forms: birthdayP2PForms
  },
  // Fundraiser Campaign 1: Wild Amer's Birthday Fundraiser
  {
    id: 'wild-amer-birthday-fundraiser',
    type: 'fundraiser',
    parentCampaignId: 'birthday-p2p-template',
    p2pPreset: 'birthday',
    name: "Wild Amer's Birthday Fundraiser",
    status: 'active',
    createdAt: '2025-11-15T00:00:00Z',
    updatedAt: '2026-01-15T10:00:00Z',
    stats: {
      totalRaised: 420,
      totalDonations: 23,
      totalDonors: 19,
      averageDonation: 18,
      topDonation: 50
    },
    crowdfunding: {
      enabled: true,
      coverPhoto: '/imgs/baby-orangutan-hammick.webp',
      title: "Wild's 35th Birthday - Help Save Orangutans",
      shortDescription: "I'm celebrating my birthday by raising £1,000 for orangutan conservation!",
      story:
        "Hey everyone! 🎉\n\nThis year, instead of gifts, I'm asking you to help me make a real difference. I've always been passionate about wildlife conservation, and orangutans hold a special place in my heart.\n\nEvery donation, no matter the size, helps fund:\n• Rescue operations for orphaned orangutans\n• Medical care and rehabilitation\n• Habitat protection and reforestation\n• Community education programs\n\nMy goal is £1,000 - let's make this birthday count! Thank you for your support. 🦧❤️",
      showProgressBar: true,
      showRecentDonations: true,
      defaultDonationsView: 'recent',
      numberOfDonationsToShow: 5,
      goalAmount: 1000
    },
    peerToPeer: {
      enabled: false
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
      linkedin: false,
      whatsapp: true,
      email: true,
      copyLink: true
    },
    fundraisers: [],
    recentDonations: [
      {
        id: 'waf1-d1',
        donorName: 'Sarah Mitchell',
        amount: 25,
        message: 'Happy Birthday Wild! Great cause!',
        isAnonymous: false,
        createdAt: '2026-01-15T09:30:00Z'
      },
      {
        id: 'waf1-d2',
        donorName: 'Tom Wilson',
        amount: 50,
        message: 'Amazing initiative! Keep up the good work.',
        isAnonymous: false,
        createdAt: '2026-01-14T18:20:00Z'
      },
      {
        id: 'waf1-d3',
        donorName: 'Anonymous',
        amount: 10,
        isAnonymous: true,
        createdAt: '2026-01-14T14:10:00Z'
      }
    ],
    forms: wildAmer1FundraiserForms
  },
  // Fundraiser Campaign 2: Wild Amer's Second Birthday Fundraiser
  {
    id: 'wild-amer-birthday-2-fundraiser',
    type: 'fundraiser',
    parentCampaignId: 'birthday-p2p-template',
    p2pPreset: 'birthday',
    name: "Wild Amer's Mini Fundraiser",
    status: 'active',
    createdAt: '2025-12-20T00:00:00Z',
    updatedAt: '2026-01-10T16:00:00Z',
    stats: {
      totalRaised: 180,
      totalDonations: 12,
      totalDonors: 11,
      averageDonation: 15,
      topDonation: 25
    },
    crowdfunding: {
      enabled: true,
      title: 'Mini Campaign for Orangutans',
      shortDescription: 'A smaller goal to test the waters - every little helps!',
      story:
        'This is my second fundraiser for orangutan conservation. I wanted to see if I could reach a modest goal of £500 through grassroots support.\n\nEven small contributions add up to make a big difference. Join me in this journey! 🦧',
      showProgressBar: true,
      showRecentDonations: true,
      defaultDonationsView: 'recent',
      numberOfDonationsToShow: 5,
      goalAmount: 500
    },
    peerToPeer: {
      enabled: false
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
      linkedin: false,
      whatsapp: true,
      email: true,
      copyLink: true
    },
    fundraisers: [],
    recentDonations: [
      {
        id: 'waf2-d1',
        donorName: 'Emma Davis',
        amount: 25,
        message: 'Great work!',
        isAnonymous: false,
        createdAt: '2026-01-10T15:00:00Z'
      },
      {
        id: 'waf2-d2',
        donorName: 'John Smith',
        amount: 15,
        isAnonymous: false,
        createdAt: '2026-01-09T12:30:00Z'
      }
    ],
    forms: wildAmer2FundraiserForms
  }
]
