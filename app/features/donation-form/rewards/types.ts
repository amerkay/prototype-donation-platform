/**
 * Rewards (free gifts) configuration types
 */

export interface RewardsSettings {
  enabled: boolean
  ui: {
    labels: {
      freeGifts: string
      freeWithDonation: string
    }
  }
}
