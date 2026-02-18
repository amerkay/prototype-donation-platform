import type { Campaign } from '~/features/campaigns/shared/types'

/**
 * Birthday Fundraiser Preset
 * Goal-oriented, celebration theme
 */
export function createBirthdayPreset(): Partial<Campaign> {
  return {
    type: 'p2p',
    p2pPreset: 'birthday',
    name: 'My Birthday Fundraiser',
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
      goalAmount: 500,
      enableSocialSharing: true
    },
    peerToPeer: {
      enabled: true,
      customMessage: 'Join me in celebrating by raising funds for a great cause!'
    }
  }
}
