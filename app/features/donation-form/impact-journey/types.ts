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
  label: string // What this amount provides (e.g., "Daily fresh fruit and vegetables")
}

/**
 * Upsell prompt settings
 * Optional CTA to encourage monthly giving or amount increases
 */
export interface UpsellSettings {
  enabled: boolean
  onceToMonthly?: {
    enabled: boolean
    message: string // e.g., "Make your impact last - switch to monthly giving"
    targetAmount?: number // Optional suggested monthly amount
  }
  increaseAmount?: {
    enabled: boolean
    message: string // e.g., "Want to provide even more? Increase your monthly gift"
  }
}

/**
 * Complete Impact Journey configuration
 */
export interface ImpactJourneySettings {
  enabled: boolean // Master toggle
  impactPerAmount: {
    items: ImpactPerAmount[] // Impact items at each amount level
  }
  upsellEnabled?: boolean // Enable upsell prompts
  upsellOnceToRecurring?: {
    enabled: boolean
    message: string // e.g., "Make your impact last - switch to recurring giving"
    targetAmount?: number // Optional suggested recurring amount (in base currency)
  }
  upsellIncreaseAmount?: {
    enabled: boolean
    message: string // e.g., "Want to provide even more? Increase your monthly gift"
  }
}
