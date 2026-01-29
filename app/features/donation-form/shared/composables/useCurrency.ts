import { computed, toValue, type MaybeRef } from 'vue'

// List of supported currencies (single source of truth)
export const CURRENCY_OPTIONS = [
  { value: 'GBP', symbol: '£', label: 'GBP (£)', description: 'United Kingdom' },
  { value: 'USD', symbol: '$', label: 'USD ($)', description: 'United States' },
  { value: 'CAD', symbol: 'CA$', label: 'CAD (CA$)', description: 'Canada' },
  { value: 'AUD', symbol: 'A$', label: 'AUD (A$)', description: 'Australia' },
  { value: 'NZD', symbol: 'NZ$', label: 'NZD (NZ$)', description: 'New Zealand' },
  { value: 'EUR', symbol: '€', label: 'EUR (€)', description: 'European Union' }
] as const

type CurrencyOption = (typeof CURRENCY_OPTIONS)[number]

const currencyOptionByCode = new Map<string, CurrencyOption>(
  CURRENCY_OPTIONS.map((c) => [c.value, c])
)

export function getCurrencyOption(currencyCode: string): CurrencyOption | undefined {
  return currencyOptionByCode.get(currencyCode.toUpperCase())
}

export function getCurrencySymbol(currencyCode: string): string {
  return getCurrencyOption(currencyCode)?.symbol ?? currencyCode
}

/**
 * Get currency data for use in forms and admin interfaces
 */
export function getCurrencyData() {
  return CURRENCY_OPTIONS.map((currency) => ({
    code: currency.value,
    label: currency.label,
    symbol: currency.symbol
  }))
}

/**
 * Get currency options formatted for combobox/select fields
 * Optionally filter by provided currency codes
 *
 * @param filterCodes - Optional array of currency codes to filter by (e.g., ['USD', 'EUR', 'GBP'])
 * @returns Array of { value, label } objects suitable for combobox fields
 *
 * @example
 * // Get all currencies
 * const allOptions = getCurrencyOptionsForSelect()
 *
 * // Get only configured currencies
 * const configuredOptions = getCurrencyOptionsForSelect(['USD', 'EUR', 'GBP'])
 */
export function getCurrencyOptionsForSelect(
  filterCodes?: string[]
): Array<{ value: string; label: string }> {
  const allOptions = [...CURRENCY_OPTIONS]

  const filteredOptions =
    filterCodes && filterCodes.length > 0
      ? (() => {
          const codesSet = new Set(filterCodes.map((code) => code.toUpperCase()))
          return allOptions.filter((opt) => codesSet.has(opt.value))
        })()
      : allOptions

  return filteredOptions.map((currency) => ({
    value: currency.value,
    label: `${currency.value} - ${currency.description}`
  }))
}

export function useCurrency(baseCurrency: MaybeRef<string> | (() => string) = 'GBP') {
  // Convert to computed for reactivity if it's a getter function
  const baseCurrencyComputed =
    typeof baseCurrency === 'function' ? computed(baseCurrency) : baseCurrency

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
    const sourceCurrency = fromCurrency || toValue(baseCurrencyComputed)
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
