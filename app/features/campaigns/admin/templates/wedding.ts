import type { Campaign } from '~/features/campaigns/shared/types'

/**
 * Wedding Fundraiser Preset
 * Celebration theme, alternative to traditional gifts
 */
export function createWeddingPreset(): Partial<Campaign> {
  return {
    type: 'p2p',
    p2pPreset: 'wedding',
    name: 'Our Wedding Fundraiser',
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
    }
  }
}
