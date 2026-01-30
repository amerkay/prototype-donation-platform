/**
 * Organization-level settings types
 */

export interface CurrencySettings {
  supportedCurrencies: string[]
  defaultCurrency: string
  currencyMultipliers: Record<string, number>
}
