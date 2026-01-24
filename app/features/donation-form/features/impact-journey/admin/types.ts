/**
 * Impact Journey configuration types
 */
import type { ImpactPerAmount } from '~/features/donation-form/features/impact-journey/donor/types'

/**
 * Complete Impact Journey configuration
 */
export interface ImpactJourneySettings {
  enabled: boolean
  impactPerAmount: {
    items: ImpactPerAmount[]
  }
  messaging?: {
    emoji?: string // Default: 🌱
    onceHeadline?: string // Default: "Your Support Today"
    monthlyHeadline?: string // Default: "Every Day You're There"
    yearlyHeadline?: string // Default: "Every Day You're There"
  }
  upsells?: {
    upsellOnceToRecurring?: boolean
    upsellCtaCopy?: string // Default: "Be Their Constant" (max 20 chars)
    upsellIncreaseAmount?: boolean
    upsellIncreaseCtaCopy?: string // Default: "Greater Impact" (max 20 chars)
  }
}
