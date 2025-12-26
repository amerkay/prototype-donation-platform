/**
 * Impact Journey types - simplified emotion-focused messaging
 *
 * Auto-generates impact messages by matching donation amounts to impact items.
 * Shows all items where item.amount <= donation amount.
 */

/**
 * Impact per amount - what each amount level provides
 * System automatically shows all items up to the donation amount
 */
export interface ImpactPerAmount {
  amount: number // Amount in base currency
  label: string // What this amount provides (e.g., "Fresh fruit weekly")
}

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
    upsellCtaCopy?: string // Default: "Be Their Constant" (max 25 chars)
    upsellIncreaseAmount?: boolean
  }
}
