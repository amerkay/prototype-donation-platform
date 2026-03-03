import type { Campaign } from '~/features/campaigns/shared/types'

/**
 * Challenge Fundraiser Preset
 * Activity-based with personal goal tracking
 */
export function createChallengePreset(): Partial<Campaign> {
  return {
    type: 'p2p',
    p2pPreset: 'challenge',
    name: 'My Challenge Fundraiser',
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
      goalAmount: 500,
      enableSocialSharing: true
    },
    peerToPeer: {
      enabled: true,
      customMessage: 'Take on a challenge and raise funds alongside me!'
    }
  }
}
