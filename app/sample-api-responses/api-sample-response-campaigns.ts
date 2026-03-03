import type { Campaign } from '~/features/campaigns/shared/types'
import {
  adoptOrangutanForm,
  birthdayP2PForm,
  tributeP2PForm,
  challengeP2PForm,
  weddingP2PForm,
  wildAmer1FundraiserForm,
  wildAmer2FundraiserForm,
  stallBookingForm,
  dogShowForm,
  classicCarForm,
  matchedGivingForm
} from './api-sample-response-forms'
import { getRecentDonations, computeCampaignStats } from './api-sample-response-transactions'
import { getCampaignFundraisers } from './api-sample-response-fundraisers'

/** Default matched giving settings (no matching) */
const noMatchedGiving = { periods: [] }

export const campaigns: Campaign[] = [
  {
    id: 'adopt-orangutan',
    type: 'standard',
    name: 'Adopt an Orangutan',
    status: 'active',
    isArchived: false,
    createdAt: '2025-01-01T00:00:00Z',
    updatedAt: '2026-01-14T10:30:00Z',
    stats: computeCampaignStats('adopt-orangutan', 'GBP', {
      totalRaised: 45820.5,
      totalDonations: 342,
      totalDonors: 287,
      averageDonation: 134,
      topDonation: 1000
    }),
    crowdfunding: {
      enabled: true,
      currency: 'GBP',
      coverPhoto: '/imgs/baby-orangutan-hammick.webp',
      title: 'Help Save Borneo Orangutans',
      shortDescription:
        'Support the rehabilitation and protection of endangered orangutans in their natural habitat.',
      story: `Our orangutan adoption program provides critical care for orphaned and injured orangutans. Each adoption helps fund veterinary care, nutritious food, and habitat restoration.\n\nWith your support, we've successfully rehabilitated and released 47 orangutans back into protected forest areas this year. Every contribution makes a real difference in saving these incredible creatures from extinction.\n\nJoin us in protecting one of our closest living relatives and preserving the biodiversity of Borneo's rainforests for future generations.`,
      showProgressBar: true,
      showRecentDonations: true,
      defaultDonationsView: 'recent',
      numberOfDonationsToShow: 5,
      goalAmount: 50000,
      endDate: '2026-10-22',
      enableSocialSharing: true
    },
    peerToPeer: {
      enabled: false
    },
    matchedGiving: noMatchedGiving,
    fundraisers: [],
    recentDonations: getRecentDonations('adopt-orangutan'),
    form: adoptOrangutanForm
  },
  {
    id: 'birthday-p2p-template',
    type: 'p2p',
    p2pPreset: 'birthday',
    name: 'Birthday Fundraiser Template',
    status: 'active',
    isArchived: false,
    createdAt: '2025-11-01T00:00:00Z',
    updatedAt: '2026-01-10T14:00:00Z',
    stats: computeCampaignStats('birthday-p2p-template', 'GBP'),
    crowdfunding: {
      enabled: true,
      currency: 'GBP',
      title: 'Help Me Celebrate by Giving Back',
      shortDescription:
        "Instead of birthday gifts, I'm asking friends and family to support a cause close to my heart.",
      story:
        "This year, I'm turning my birthday into an opportunity to make a difference. Instead of presents, I'd love for you to donate to this cause that means so much to me.\n\nEvery contribution, no matter how small, helps us get closer to our goal. Thank you for celebrating with me!",
      showProgressBar: true,
      showRecentDonations: true,
      defaultDonationsView: 'recent',
      numberOfDonationsToShow: 5,
      goalAmount: 500,
      enableSocialSharing: true
    },
    peerToPeer: {
      enabled: true,
      customMessage: 'Join me in celebrating by raising funds for a great cause!'
    },
    matchedGiving: {
      periods: [
        {
          id: 'mp-p2p-1',
          name: 'Birthday Month Match',
          matchMultiplier: 2,
          poolAmount: 10000,
          poolDrawn: 180,
          startDate: '2026-03-01T00:00:00Z',
          endDate: '2026-03-31T00:00:00Z',
          matcherName: 'Anonymous Donor',
          displayMessage: 'All birthday fundraiser donations matched this month!'
        }
      ]
    },
    fundraisers: getCampaignFundraisers('birthday-p2p-template'),
    recentDonations: getRecentDonations('birthday-p2p-template'),
    form: birthdayP2PForm
  },
  // P2P Template: Tribute & Memorial
  {
    id: 'tribute-p2p-template',
    type: 'p2p',
    p2pPreset: 'tribute',
    name: 'In Memory of a Loved One',
    status: 'active',
    isArchived: false,
    createdAt: '2025-10-01T00:00:00Z',
    updatedAt: '2026-01-12T09:00:00Z',
    stats: computeCampaignStats('tribute-p2p-template', 'GBP', {
      totalRaised: 12450,
      totalDonations: 89,
      totalDonors: 76,
      averageDonation: 140,
      topDonation: 500
    }),
    crowdfunding: {
      enabled: true,
      currency: 'GBP',
      title: 'In Memory of Someone Special',
      shortDescription: 'Honouring a life well lived by supporting a cause they believed in.',
      story:
        'We are raising funds in memory of someone very dear to us. Their passion for this cause inspired everyone around them, and we want to continue that legacy.\n\nYour donation is a meaningful tribute that keeps their spirit alive through the work of this charity. Thank you for joining us in remembering them.',
      showProgressBar: true,
      showRecentDonations: true,
      defaultDonationsView: 'recent',
      numberOfDonationsToShow: 10,
      goalAmount: 500,
      enableSocialSharing: true
    },
    peerToPeer: {
      enabled: true,
      customMessage:
        'Help us honour their memory by raising funds for a cause they cared deeply about.'
    },
    matchedGiving: noMatchedGiving,
    fundraisers: [],
    recentDonations: getRecentDonations('tribute-p2p-template'),
    form: tributeP2PForm
  },
  // P2P Template: Challenge Fundraiser
  {
    id: 'challenge-p2p-template',
    type: 'p2p',
    p2pPreset: 'challenge',
    name: 'Marathon Challenge Fundraiser',
    status: 'active',
    isArchived: false,
    createdAt: '2025-09-15T00:00:00Z',
    updatedAt: '2026-01-08T11:00:00Z',
    stats: computeCampaignStats('challenge-p2p-template', 'GBP', {
      totalRaised: 28340,
      totalDonations: 215,
      totalDonors: 189,
      averageDonation: 132,
      topDonation: 750
    }),
    crowdfunding: {
      enabled: true,
      currency: 'GBP',
      title: "I'm Taking on a Challenge for Charity",
      shortDescription: 'Sponsor my challenge and help raise funds for an incredible cause.',
      story:
        "I'm pushing myself to take on a personal challenge, and I need your support! Every donation motivates me to keep going and helps this charity do amazing work.\n\nWhether it's a marathon, a swim, a climb, or something entirely different — your sponsorship makes it all worthwhile. Follow my progress and cheer me on!",
      showProgressBar: true,
      showRecentDonations: true,
      defaultDonationsView: 'recent',
      numberOfDonationsToShow: 5,
      goalAmount: 500,
      enableSocialSharing: true
    },
    peerToPeer: {
      enabled: true,
      customMessage: 'Take on a challenge and raise funds alongside me!'
    },
    matchedGiving: noMatchedGiving,
    fundraisers: [],
    recentDonations: getRecentDonations('challenge-p2p-template'),
    form: challengeP2PForm
  },
  // P2P Template: Wedding Fundraiser
  {
    id: 'wedding-p2p-template',
    type: 'p2p',
    p2pPreset: 'wedding',
    name: 'Our Wedding Fundraiser',
    status: 'active',
    isArchived: false,
    createdAt: '2025-08-01T00:00:00Z',
    updatedAt: '2026-01-05T16:00:00Z',
    stats: computeCampaignStats('wedding-p2p-template', 'GBP', {
      totalRaised: 8720,
      totalDonations: 64,
      totalDonors: 58,
      averageDonation: 136,
      topDonation: 500
    }),
    crowdfunding: {
      enabled: true,
      currency: 'GBP',
      title: 'Instead of Gifts, Please Donate',
      shortDescription: 'We have everything we need — except your support for a cause we love.',
      story:
        "As we celebrate our wedding, we'd love for our guests to join us in making a difference. Instead of traditional gifts, we're asking for donations to this charity that is close to both our hearts.\n\nYour generosity will be the most meaningful gift we could receive. Thank you for being part of our special day and helping us give back.",
      showProgressBar: true,
      showRecentDonations: true,
      defaultDonationsView: 'top',
      numberOfDonationsToShow: 10,
      goalAmount: 1000,
      enableSocialSharing: true
    },
    peerToPeer: {
      enabled: true,
      customMessage: 'Help us celebrate our wedding by supporting a cause we care about!'
    },
    matchedGiving: noMatchedGiving,
    fundraisers: [],
    recentDonations: getRecentDonations('wedding-p2p-template'),
    form: weddingP2PForm
  },
  // P2P Fundraiser Campaign 1: Wild Amer's Birthday Fundraiser
  {
    id: 'wild-amer-birthday-fundraiser',
    type: 'p2p-fundraiser',
    parentCampaignId: 'birthday-p2p-template',
    p2pPreset: 'birthday',
    name: "Wild Amer's Birthday Fundraiser",
    status: 'active',
    isArchived: false,
    createdAt: '2025-11-15T00:00:00Z',
    updatedAt: '2026-01-15T10:00:00Z',
    stats: computeCampaignStats('wild-amer-birthday-fundraiser', 'GBP'),
    crowdfunding: {
      enabled: true,
      currency: 'GBP',
      coverPhoto: '/imgs/baby-orangutan-hammick.webp',
      title: "Wild's 35th Birthday - Help Save Orangutans",
      shortDescription: "I'm celebrating my birthday by raising £1,000 for orangutan conservation!",
      story:
        "Hey everyone! 🎉\n\nThis year, instead of gifts, I'm asking you to help me make a real difference. I've always been passionate about wildlife conservation, and orangutans hold a special place in my heart.\n\nEvery donation, no matter the size, helps fund:\n• Rescue operations for orphaned orangutans\n• Medical care and rehabilitation\n• Habitat protection and reforestation\n• Community education programs\n\nMy goal is £1,000 - let's make this birthday count! Thank you for your support. 🦧❤️",
      showProgressBar: true,
      showRecentDonations: true,
      defaultDonationsView: 'recent',
      numberOfDonationsToShow: 5,
      goalAmount: 1000,
      enableSocialSharing: true
    },
    peerToPeer: {
      enabled: false
    },
    matchedGiving: noMatchedGiving,
    fundraisers: [],
    recentDonations: getRecentDonations('wild-amer-birthday-fundraiser'),
    form: wildAmer1FundraiserForm
  },
  // P2P Fundraiser Campaign 2: Wild Amer's Second Birthday Fundraiser
  {
    id: 'wild-amer-birthday-2-fundraiser',
    type: 'p2p-fundraiser',
    parentCampaignId: 'birthday-p2p-template',
    p2pPreset: 'birthday',
    name: "Wild Amer's Mini Fundraiser",
    status: 'completed',
    isArchived: false,
    createdAt: '2025-12-20T00:00:00Z',
    updatedAt: '2026-01-10T16:00:00Z',
    stats: computeCampaignStats('wild-amer-birthday-2-fundraiser', 'GBP'),
    crowdfunding: {
      enabled: true,
      currency: 'GBP',
      title: 'Mini Campaign for Orangutans',
      shortDescription: 'A smaller goal to test the waters - every little helps!',
      story:
        'This is my second fundraiser for orangutan conservation. I wanted to see if I could reach a modest goal of £500 through grassroots support.\n\nEven small contributions add up to make a big difference. Join me in this journey! 🦧',
      showProgressBar: true,
      showRecentDonations: true,
      defaultDonationsView: 'recent',
      numberOfDonationsToShow: 5,
      goalAmount: 500,
      enableSocialSharing: true
    },
    peerToPeer: {
      enabled: false
    },
    matchedGiving: noMatchedGiving,
    fundraisers: [],
    recentDonations: getRecentDonations('wild-amer-birthday-2-fundraiser'),
    form: wildAmer2FundraiserForm
  },
  // Standard campaign with matched giving enabled
  {
    id: 'matched-giving-spring',
    type: 'standard',
    name: 'Spring Matched Giving Appeal',
    status: 'active',
    isArchived: false,
    createdAt: '2026-02-01T00:00:00Z',
    updatedAt: '2026-02-15T10:00:00Z',
    stats: computeCampaignStats('matched-giving-spring', 'GBP', {
      totalRaised: 5200,
      totalDonations: 124,
      totalDonors: 108,
      averageDonation: 42,
      topDonation: 500
    }),
    crowdfunding: {
      enabled: true,
      currency: 'GBP',
      coverPhoto: '/imgs/baby-orangutan-hammick.webp',
      title: 'Double Your Impact — Spring Matched Giving',
      shortDescription:
        'Every donation doubled! A generous supporter is matching all gifts pound for pound.',
      story:
        "Thanks to an incredibly generous donor, every pound you give this spring will be matched — doubling your impact for orangutan conservation.\n\nThis is a limited-time opportunity. The matching fund runs until we hit our £15,000 target or the end date, whichever comes first.\n\nDon't miss this chance to make your donation go twice as far!",
      showProgressBar: true,
      showRecentDonations: true,
      defaultDonationsView: 'recent',
      numberOfDonationsToShow: 5,
      goalAmount: 15000,
      endDate: '2026-06-30',
      enableSocialSharing: true
    },
    peerToPeer: {
      enabled: false
    },
    // 2x match: each £1 donated draws £1 from pool → poolDrawn ≈ totalRaised
    matchedGiving: {
      periods: [
        {
          id: 'mp-1',
          name: 'Launch Week Double Match',
          matchMultiplier: 2,
          poolAmount: 30000,
          poolDrawn: 5200,
          startDate: '2026-03-01T00:00:00Z',
          endDate: '2026-03-15T00:00:00Z',
          matcherName: 'The Wilkinson Foundation',
          matcherLogo: '/imgs/BOS-USA-logo-green.webp',
          displayMessage: 'Every pound you donate is matched pound for pound!'
        },
        {
          id: 'mp-2',
          name: 'Spring Triple Match',
          matchMultiplier: 3,
          poolAmount: 20000,
          poolDrawn: 0,
          startDate: '2026-03-16T00:00:00Z',
          endDate: '2026-03-31T00:00:00Z',
          matcherName: 'Smith Family Trust',
          displayMessage: 'Triple your impact this spring!'
        }
      ]
    },
    fundraisers: [],
    recentDonations: getRecentDonations('adopt-orangutan'),
    form: matchedGivingForm
  },
  // --- Event campaigns ---
  // Event: Summer Fete Stall Booking
  {
    id: 'summer-fete-stalls',
    type: 'event',
    name: 'Summer Fete Stall Booking',
    status: 'active',
    isArchived: false,
    createdAt: '2026-01-05T00:00:00Z',
    updatedAt: '2026-02-01T10:00:00Z',
    stats: computeCampaignStats('summer-fete-stalls', 'GBP', {
      totalRaised: 875,
      totalDonations: 28,
      totalDonors: 28,
      averageDonation: 31,
      topDonation: 45
    }),
    crowdfunding: {
      enabled: true,
      currency: 'GBP',
      title: 'Summer Fete 2026 — Book Your Stall',
      shortDescription:
        'Reserve a stall for the annual Summer Fete. Choose from standard, large, or corner positions.',
      story:
        'Our annual Summer Fete returns on 12 July 2026! Stall holders can sell crafts, baked goods, plants, vintage finds, and more.\n\nAll proceeds from stall fees go towards the village hall renovation fund. Book early — spaces fill up fast!',
      showProgressBar: false,
      showRecentDonations: false,
      defaultDonationsView: 'recent',
      numberOfDonationsToShow: 0,
      enableSocialSharing: true
    },
    peerToPeer: { enabled: false },
    matchedGiving: noMatchedGiving,
    fundraisers: [],
    recentDonations: [],
    form: stallBookingForm
  },
  // Event: Annual Dog Show
  {
    id: 'annual-dog-show',
    type: 'event',
    name: 'Annual Dog Show',
    status: 'active',
    isArchived: false,
    createdAt: '2026-01-10T00:00:00Z',
    updatedAt: '2026-02-05T10:00:00Z',
    stats: computeCampaignStats('annual-dog-show', 'GBP', {
      totalRaised: 142.5,
      totalDonations: 57,
      totalDonors: 34,
      averageDonation: 2.5,
      topDonation: 15
    }),
    crowdfunding: {
      enabled: true,
      currency: 'GBP',
      title: 'Village Dog Show 2026',
      shortDescription:
        'Enter your dog into one or more categories — just £2.50 per entry. All welcome, pedigree or not!',
      story:
        "Our beloved village dog show is back! Categories include Top Survivor, Cutest Puppy, Best in Show, Waggiest Tail, Best Trick, and Golden Oldie.\n\nEnter as many categories as you like at £2.50 each. Rosettes for all winners and a trophy for Best in Show. All entry fees support the local animal rescue centre.\n\nBring the whole family — there'll be refreshments, a raffle, and plenty of tail-wagging fun!",
      showProgressBar: false,
      showRecentDonations: false,
      defaultDonationsView: 'recent',
      numberOfDonationsToShow: 0,
      enableSocialSharing: true
    },
    peerToPeer: { enabled: false },
    matchedGiving: noMatchedGiving,
    fundraisers: [],
    recentDonations: [],
    form: dogShowForm
  },
  // Event: Classic Car Show (free entry)
  {
    id: 'classic-car-show',
    type: 'event',
    name: 'Classic Car Show',
    status: 'active',
    isArchived: false,
    createdAt: '2026-01-12T00:00:00Z',
    updatedAt: '2026-02-08T10:00:00Z',
    stats: computeCampaignStats('classic-car-show', 'GBP', {
      totalRaised: 0,
      totalDonations: 41,
      totalDonors: 41,
      averageDonation: 0,
      topDonation: 0
    }),
    crowdfunding: {
      enabled: true,
      currency: 'GBP',
      title: 'Classic Car Show — Free Entry',
      shortDescription:
        'Register your classic car for the annual show. All makes, models, and years welcome.',
      story:
        "Calling all classic car enthusiasts! Register your pride and joy for our open-air display on the village green.\n\nEntry is completely free. Simply register and turn up on the day. There's no judging — just a chance to show off your car and meet fellow petrolheads.\n\nSpectators welcome, no registration needed.",
      showProgressBar: false,
      showRecentDonations: false,
      defaultDonationsView: 'recent',
      numberOfDonationsToShow: 0,
      enableSocialSharing: true
    },
    peerToPeer: { enabled: false },
    matchedGiving: noMatchedGiving,
    fundraisers: [],
    recentDonations: [],
    form: classicCarForm
  }
]
