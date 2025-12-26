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
  upsellEnabled?: boolean
  upsellOnceToRecurring?: {
    enabled: boolean
    targetAmount?: number // In base currency
  }
  upsellIncreaseAmount?: {
    enabled: boolean
  }
}
