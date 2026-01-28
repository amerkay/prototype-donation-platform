/**
 * Impact Boost configuration types
 * Simplified emotional messaging for upsells - no complex amount thresholds
 */

/**
 * Complete Impact Boost configuration
 */
export interface ImpactBoostSettings {
  enabled: boolean
  messages: {
    recurringBoostMessage: string // Emotional appeal for one-time → recurring (e.g., "Your monthly gift means they can count on you every single day")
    increaseBoostMessage: string // Emotional appeal for increasing amount (e.g., "A little more today creates lasting change tomorrow")
  }
  upsells: {
    enableRecurringBoost?: boolean // Show one-time → recurring CTA
    enableIncreaseBoost?: boolean // Show amount increase CTA
  }
}
