// Base currency for all products and amounts
export const BASE_CURRENCY = 'GBP'

export function useCurrency() {
  const currencySymbols: Record<string, string> = {
    USD: '$',
    EUR: '€',
    GBP: '£',
    CAD: 'CA$',
    AUD: 'AU$',
    INR: '₹',
  }

  // Exchange rates relative to USD
  const exchangeRates: Record<string, number> = {
    USD: 1,
    EUR: 0.92,
    GBP: 0.79,
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

  const convertPrice = (basePrice: number, targetCurrency: string): number => {
    if (targetCurrency === BASE_CURRENCY) {
      return basePrice
    }

    const baseRate = exchangeRates[BASE_CURRENCY]
    const targetRate = exchangeRates[targetCurrency]

    if (!baseRate || !targetRate) {
      return basePrice
    }

    // Convert: baseCurrency -> USD -> targetCurrency
    const inUSD = basePrice / baseRate
    const converted = inUSD * targetRate
    return smartRound(converted)
  }

  return {
    getCurrencySymbol,
    convertPrice,
  }
}
