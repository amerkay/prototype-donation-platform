import type { Campaign } from '~/features/campaigns/shared/types'

/**
 * Custom P2P Preset
 * Blank slate for admins to build their own P2P campaign from scratch
 */
export function createCustomPreset(): Partial<Campaign> {
  return {
    type: 'p2p',
    p2pPreset: 'custom',
    name: 'My P2P Fundraiser',
    crowdfunding: {
      enabled: true,
      title: 'Support Our Cause',
      shortDescription:
        'Create your own fundraising page and rally your community to make a difference.',
      story:
        'Welcome to our peer-to-peer fundraising campaign! Each fundraiser created here helps us reach more supporters and raise more funds for our mission.\n\nCustomise your story, set your goal, and share with friends and family. Together, we can achieve something extraordinary.',
      showProgressBar: true,
      showRecentDonations: true,
      defaultDonationsView: 'recent',
      numberOfDonationsToShow: 5,
      goalAmount: 500,
      enableSocialSharing: true
    },
    peerToPeer: {
      enabled: true,
      customMessage: 'Start your own fundraiser and help us reach our goal!'
    }
  }
}
