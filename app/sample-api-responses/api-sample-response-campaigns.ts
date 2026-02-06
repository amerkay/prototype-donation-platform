import type { Campaign } from '~/features/campaigns/shared/types'
import {
  adoptOrangutanForms,
  birthdayP2PForms,
  tributeP2PForms,
  challengeP2PForms,
  weddingP2PForms,
  wildAmer1FundraiserForms,
  wildAmer2FundraiserForms
} from './api-sample-response-forms'
import { getRecentDonations, computeCampaignStats } from './api-sample-response-transactions'
import { getCampaignFundraisers } from './api-sample-response-fundraisers'

export const campaigns: Campaign[] = [
  {
    id: 'adopt-orangutan',
    type: 'standard',
    name: 'Adopt an Orangutan',
    status: 'active',
    createdAt: '2025-01-01T00:00:00Z',
    updatedAt: '2026-01-14T10:30:00Z',
    stats: computeCampaignStats('adopt-orangutan', {
      totalRaised: 45820.5,
      totalDonations: 342,
      totalDonors: 287,
      averageDonation: 134,
      topDonation: 1000,
      daysRemaining: 45
    }),
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
    recentDonations: getRecentDonations('adopt-orangutan'),
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
    stats: computeCampaignStats('birthday-p2p-template'),
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
    socialSharing: {
      enabled: true,
      facebook: true,
      twitter: true,
      linkedin: false,
      whatsapp: true,
      email: true,
      copyLink: true
    },
    fundraisers: getCampaignFundraisers('birthday-p2p-template'),
    recentDonations: getRecentDonations('birthday-p2p-template'),
    forms: birthdayP2PForms
  },
  // P2P Template: Tribute & Memorial
  {
    id: 'tribute-p2p-template',
    type: 'p2p',
    p2pPreset: 'tribute',
    name: 'In Memory of a Loved One',
    status: 'active',
    createdAt: '2025-10-01T00:00:00Z',
    updatedAt: '2026-01-12T09:00:00Z',
    stats: computeCampaignStats('tribute-p2p-template', {
      totalRaised: 12450,
      totalDonations: 89,
      totalDonors: 76,
      averageDonation: 140,
      topDonation: 500
    }),
    crowdfunding: {
      enabled: true,
      title: 'In Memory of Someone Special',
      shortDescription: 'Honouring a life well lived by supporting a cause they believed in.',
      story:
        'We are raising funds in memory of someone very dear to us. Their passion for this cause inspired everyone around them, and we want to continue that legacy.\n\nYour donation is a meaningful tribute that keeps their spirit alive through the work of this charity. Thank you for joining us in remembering them.',
      showProgressBar: true,
      showRecentDonations: true,
      defaultDonationsView: 'recent',
      numberOfDonationsToShow: 10,
      goalAmount: 500
    },
    peerToPeer: {
      enabled: true,
      customMessage:
        'Help us honour their memory by raising funds for a cause they cared deeply about.'
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
    recentDonations: getRecentDonations('tribute-p2p-template'),
    forms: tributeP2PForms
  },
  // P2P Template: Challenge Fundraiser
  {
    id: 'challenge-p2p-template',
    type: 'p2p',
    p2pPreset: 'challenge',
    name: 'Marathon Challenge Fundraiser',
    status: 'active',
    createdAt: '2025-09-15T00:00:00Z',
    updatedAt: '2026-01-08T11:00:00Z',
    stats: computeCampaignStats('challenge-p2p-template', {
      totalRaised: 28340,
      totalDonations: 215,
      totalDonors: 189,
      averageDonation: 132,
      topDonation: 750
    }),
    crowdfunding: {
      enabled: true,
      title: "I'm Taking on a Challenge for Charity",
      shortDescription: 'Sponsor my challenge and help raise funds for an incredible cause.',
      story:
        "I'm pushing myself to take on a personal challenge, and I need your support! Every donation motivates me to keep going and helps this charity do amazing work.\n\nWhether it's a marathon, a swim, a climb, or something entirely different — your sponsorship makes it all worthwhile. Follow my progress and cheer me on!",
      showProgressBar: true,
      showRecentDonations: true,
      defaultDonationsView: 'recent',
      numberOfDonationsToShow: 5,
      goalAmount: 500
    },
    peerToPeer: {
      enabled: true,
      customMessage: 'Take on a challenge and raise funds alongside me!'
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
    recentDonations: getRecentDonations('challenge-p2p-template'),
    forms: challengeP2PForms
  },
  // P2P Template: Wedding Fundraiser
  {
    id: 'wedding-p2p-template',
    type: 'p2p',
    p2pPreset: 'wedding',
    name: 'Our Wedding Fundraiser',
    status: 'active',
    createdAt: '2025-08-01T00:00:00Z',
    updatedAt: '2026-01-05T16:00:00Z',
    stats: computeCampaignStats('wedding-p2p-template', {
      totalRaised: 8720,
      totalDonations: 64,
      totalDonors: 58,
      averageDonation: 136,
      topDonation: 500
    }),
    crowdfunding: {
      enabled: true,
      title: 'Instead of Gifts, Please Donate',
      shortDescription: 'We have everything we need — except your support for a cause we love.',
      story:
        "As we celebrate our wedding, we'd love for our guests to join us in making a difference. Instead of traditional gifts, we're asking for donations to this charity that is close to both our hearts.\n\nYour generosity will be the most meaningful gift we could receive. Thank you for being part of our special day and helping us give back.",
      showProgressBar: true,
      showRecentDonations: true,
      defaultDonationsView: 'top',
      numberOfDonationsToShow: 10,
      goalAmount: 1000
    },
    peerToPeer: {
      enabled: true,
      customMessage: 'Help us celebrate our wedding by supporting a cause we care about!'
    },
    socialSharing: {
      enabled: true,
      facebook: true,
      twitter: false,
      linkedin: false,
      whatsapp: true,
      email: true,
      copyLink: true
    },
    fundraisers: [],
    recentDonations: getRecentDonations('wedding-p2p-template'),
    forms: weddingP2PForms
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
    stats: computeCampaignStats('wild-amer-birthday-fundraiser'),
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
    recentDonations: getRecentDonations('wild-amer-birthday-fundraiser'),
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
    stats: computeCampaignStats('wild-amer-birthday-2-fundraiser'),
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
    recentDonations: getRecentDonations('wild-amer-birthday-2-fundraiser'),
    forms: wildAmer2FundraiserForms
  }
]
