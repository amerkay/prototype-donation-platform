/**
 * Exchange rates for currency conversion
 * Base rates from different currencies (1 unit of base = X units of target)
 *
 * In production, these would come from a live API (e.g., exchangerate-api.com)
 * Last updated: January 2026
 */

export interface ExchangeRates {
  // Base currency code
  base: string
  // Target currency rates (1 base = X target)
  rates: Record<string, number>
}

/**
 * Exchange rates from GBP (British Pound)
 */
export const exchangeRatesFromGBP: ExchangeRates = {
  base: 'GBP',
  rates: {
    GBP: 1,
    USD: 1.27,
    CAD: 1.71,
    AUD: 1.97,
    NZD: 2.14,
    EUR: 1.17
  }
}

/**
 * Exchange rates from USD (US Dollar)
 */
export const exchangeRatesFromUSD: ExchangeRates = {
  base: 'USD',
  rates: {
    USD: 1,
    GBP: 0.79,
    CAD: 1.35,
    AUD: 1.55,
    NZD: 1.69,
    EUR: 0.92
  }
}

/**
 * Exchange rates from EUR (Euro)
 */
export const exchangeRatesFromEUR: ExchangeRates = {
  base: 'EUR',
  rates: {
    EUR: 1,
    GBP: 0.86,
    USD: 1.09,
    CAD: 1.46,
    AUD: 1.68,
    NZD: 1.83
  }
}

/**
 * Exchange rates from CAD (Canadian Dollar)
 */
export const exchangeRatesFromCAD: ExchangeRates = {
  base: 'CAD',
  rates: {
    CAD: 1,
    GBP: 0.58,
    USD: 0.74,
    EUR: 0.68,
    AUD: 1.15,
    NZD: 1.25
  }
}

/**
 * Exchange rates from AUD (Australian Dollar)
 */
export const exchangeRatesFromAUD: ExchangeRates = {
  base: 'AUD',
  rates: {
    AUD: 1,
    GBP: 0.51,
    USD: 0.65,
    CAD: 0.87,
    EUR: 0.6,
    NZD: 1.09
  }
}

/**
 * Exchange rates from NZD (New Zealand Dollar)
 */
export const exchangeRatesFromNZD: ExchangeRates = {
  base: 'NZD',
  rates: {
    NZD: 1,
    GBP: 0.47,
    USD: 0.59,
    CAD: 0.8,
    AUD: 0.92,
    EUR: 0.55
  }
}

/**
 * Get exchange rates for a specific base currency
 */
export function getExchangeRatesForBase(baseCurrency: string): ExchangeRates {
  const base = baseCurrency.toUpperCase()

  switch (base) {
    case 'GBP':
      return exchangeRatesFromGBP
    case 'USD':
      return exchangeRatesFromUSD
    case 'EUR':
      return exchangeRatesFromEUR
    case 'CAD':
      return exchangeRatesFromCAD
    case 'AUD':
      return exchangeRatesFromAUD
    case 'NZD':
      return exchangeRatesFromNZD
    default:
      // Default to GBP if unknown currency
      return exchangeRatesFromGBP
  }
}
