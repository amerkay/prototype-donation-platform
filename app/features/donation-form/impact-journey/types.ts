/**
 * Impact Journey types - educational messaging for donation impact
 */

export interface ImpactMessage {
  threshold: number // Currency value in baseCurrency
  title: string // Bold heading
  description: string // Body text
  showCta?: boolean // Whether to show CTA button
  ctaText?: string // Button text
  ctaAction?: 'switch-monthly' | 'switch-yearly' // What button does
  ctaTargetAmount?: number // Optional preset amount to set when switching (in base currency)
}

export interface FrequencyImpactConfig {
  enabled: boolean // Show messages for this tab
  messages: ImpactMessage[] // Array of threshold-based messages
}

export interface ImpactJourneySettings {
  enabled: boolean // Master toggle
  frequencies: {
    once: FrequencyImpactConfig
    monthly: FrequencyImpactConfig
    yearly: FrequencyImpactConfig
    multiple: FrequencyImpactConfig
  }
}
