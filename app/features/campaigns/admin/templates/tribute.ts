import type { Campaign } from '~/features/campaigns/shared/types'

/**
 * Tribute & Memorial Preset
 * Memorial/honour theme with respectful messaging
 */
export function createTributePreset(): Partial<Campaign> {
  return {
    type: 'p2p',
    p2pPreset: 'tribute',
    name: 'In Memory of a Loved One',
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
    }
  }
}
