// List of supported currencies
export const CURRENCY_OPTIONS = [
  { value: 'GBP', label: 'GBP - British Pound', description: '£ - United Kingdom' },
  { value: 'USD', label: 'USD - US Dollar', description: '$ - United States' },
  { value: 'CAD', label: 'CAD - Canadian Dollar', description: 'CA$ - Canada' },
  { value: 'AUD', label: 'AUD - Australian Dollar', description: 'A$ - Australia' },
  { value: 'NZD', label: 'NZD - New Zealand Dollar', description: 'NZ$ - New Zealand' },
  { value: 'EUR', label: 'EUR - Euro', description: '€ - European Union' }
] as const

// Extract currency symbols from descriptions
const currencySymbols: Record<string, string> = {
  GBP: '£',
  USD: '$',
  CAD: 'CA$',
  AUD: 'A$',
  NZD: 'NZ$',
  EUR: '€'
}

/**
 * Get currency data for use in forms and admin interfaces
 */
export function getCurrencyData() {
  return CURRENCY_OPTIONS.map((currency) => ({
    code: currency.value,
    label: currency.label,
    symbol: currencySymbols[currency.value] || currency.value
  }))
}

export function useCurrency(baseCurrency: string = 'GBP') {
  // Exchange rates: 1 unit of base currency = X units of target currency
  // These are approximate rates and should be updated from a live API in production
  const getExchangeRates = (base: string): Record<string, number> => {
    const ratesFromGBP: Record<string, number> = {
      GBP: 1,
      USD: 1.27,
      CAD: 1.71,
      AUD: 1.97,
      NZD: 2.14,
      EUR: 1.17
    }

    const ratesFromUSD: Record<string, number> = {
      USD: 1,
      GBP: 0.79,
      CAD: 1.35,
      AUD: 1.55,
      NZD: 1.69,
      EUR: 0.92
    }

    const ratesFromEUR: Record<string, number> = {
      EUR: 1,
      GBP: 0.86,
      USD: 1.09,
      CAD: 1.46,
      AUD: 1.68,
      NZD: 1.83
    }

    // Return the appropriate rate table based on base currency
    switch (base) {
      case 'GBP':
        return ratesFromGBP
      case 'USD':
        return ratesFromUSD
      case 'EUR':
        return ratesFromEUR
      default:
        return ratesFromGBP
    }
  }

  const getCurrencySymbol = (currencyCode: string): string => {
    return currencySymbols[currencyCode.toUpperCase()] || currencyCode
  }

  const smartRound = (value: number): number => {
    if (value < 5) {
      // Round to nearest even number
      return Math.round(value)
    } else if (value < 50) {
      // Round to nearest 5
      return Math.round(value / 5) * 5
    } else if (value < 200) {
      // Round to nearest 25
      return Math.round(value / 25) * 25
    } else if (value < 500) {
      // Round to nearest 50
      return Math.round(value / 50) * 50
    } else {
      // Round to nearest 100
      return Math.round(value / 100) * 100
    }
  }

  const convertPrice = (
    basePrice: number,
    targetCurrency: string,
    fromCurrency?: string
  ): number => {
    const sourceCurrency = fromCurrency || baseCurrency
    const target = targetCurrency.toUpperCase()
    const source = sourceCurrency.toUpperCase()

    // No conversion needed
    if (target === source) {
      return basePrice
    }

    const exchangeRates = getExchangeRates(source)
    const rate = exchangeRates[target]

    if (!rate) {
      console.warn(`No exchange rate found for ${source} -> ${target}`)
      return basePrice
    }

    // Convert: multiply by the rate (1 source = rate target)
    const converted = basePrice * rate
    return smartRound(converted)
  }

  return {
    getCurrencySymbol,
    convertPrice
  }
}
