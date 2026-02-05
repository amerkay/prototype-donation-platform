/**
 * Organization-level settings types
 */

export interface CurrencySettings {
  supportedCurrencies: string[]
  defaultCurrency: string
  currencyMultipliers: Record<string, number>
}

/**
 * Per-currency charity override (e.g., different registration in another country)
 */
export interface CharityCurrencyOverride {
  enabled: boolean
  name?: string
  registrationNumber?: string
  address?: string
}

/**
 * Organization-level charity settings
 */
export interface CharitySettings {
  slug: string
  name: string
  registrationNumber: string
  address: string
  website: string
  description: string
  currencyOverrides: Record<string, CharityCurrencyOverride>
}
