import { computed, toValue, type MaybeRef } from 'vue'
import { getExchangeRatesForBase } from '~/sample-api-responses/api-sample-response-exchange-rates'
import { useCurrencySettingsStore } from '~/features/settings/admin/stores/currencySettings'

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

/**
 * Compute direct and inverse currency multipliers from store configuration
 * Cross-currency conversions are calculated on-demand for simplicity
 *
 * @param accountDefaultCurrency - Account-level default currency
 * @param formBaseCurrency - Form-level base currency (may differ from account)
 * @param configMultipliers - Multipliers from store relative to account default
 * @returns Object with accountDefault, formBase, and multiplier lookups
 */
function computeMultiplierConfig(
  accountDefaultCurrency: string,
  formBaseCurrency: string,
  configMultipliers: Record<string, number>
) {
  const accountDefault = accountDefaultCurrency.toUpperCase()
  const formBase = formBaseCurrency.toUpperCase()
  const multipliers = new Map<string, number>()

  // Store direct mappings from account default currency
  for (const [currency, multiplier] of Object.entries(configMultipliers)) {
    const curr = currency.toUpperCase()
    multipliers.set(`${accountDefault}->${curr}`, multiplier)
    multipliers.set(`${curr}->${accountDefault}`, 1 / multiplier)
  }

  return { accountDefault, formBase, multipliers }
}

export function useCurrency(baseCurrency: MaybeRef<string> | (() => string) = 'GBP') {
  // Convert to computed for reactivity if it's a getter function
  const baseCurrencyComputed =
    typeof baseCurrency === 'function' ? computed(baseCurrency) : baseCurrency

  // Access currency settings store for multipliers
  const currencySettingsStore = useCurrencySettingsStore()

  // Compute multiplier configuration (reactive to store changes)
  const multiplierConfig = computed(() => {
    const accountDefaultCurrency = currencySettingsStore.defaultCurrency
    const formBaseCurrency = toValue(baseCurrencyComputed)
    const configMultipliers = currencySettingsStore.currencyMultipliers

    return computeMultiplierConfig(accountDefaultCurrency, formBaseCurrency, configMultipliers)
  })

  /**
   * Get multiplier for currency conversion with just-in-time calculation
   * Handles: identity, direct, inverse, and cross-currency conversions
   */
  const getMultiplier = (fromCurrency: string, toCurrency: string): number => {
    const from = fromCurrency.toUpperCase()
    const to = toCurrency.toUpperCase()
    const { accountDefault, formBase, multipliers } = multiplierConfig.value

    // Identity: same currency
    if (from === to) return 1.0

    // Direct lookup in multipliers map
    const directKey = `${from}->${to}`
    if (multipliers.has(directKey)) return multipliers.get(directKey)!

    // Cross-currency conversion through base
    // For example: USD->EUR goes through GBP (USD->GBP->EUR)
    const baseCurrency = from === formBase || to === formBase ? accountDefault : formBase
    const fromToBase = multipliers.get(`${from}->${baseCurrency}`) ?? 1.0
    const baseToTo = multipliers.get(`${baseCurrency}->${to}`) ?? 1.0

    return fromToBase * baseToTo
  }

  // Exchange rates now come from centralized API response file
  const getExchangeRates = (base: string): Record<string, number> => {
    const rates = getExchangeRatesForBase(base)
    return rates.rates
  }

  /**
   * Smart rounding to clean preset values with automatic multiplier application
   *
   * Multipliers are automatically applied based on:
   * - Account-level currency settings
   * - Current form's base currency
   * - Target currency for the conversion
   *
   * No need to pass multipliers manually - they're fetched from store automatically!
   *
   * @param value - Value to round
   * @param targetCurrency - Currency to round for (optional, uses base currency if not provided)
   * @param sourceCurrency - Currency value is in (optional, uses base currency if not provided)
   * @returns Rounded value with multiplier applied
   *
   * @example
   * const { smartRound } = useCurrency('GBP')
   * smartRound(10.5, 'USD', 'GBP') // Applies GBP->USD multiplier automatically
   */
  const smartRound = (value: number, targetCurrency?: string, sourceCurrency?: string): number => {
    // Determine source and target currencies
    const source = (sourceCurrency || toValue(baseCurrencyComputed)).toUpperCase()
    const target = (targetCurrency || toValue(baseCurrencyComputed)).toUpperCase()

    // Get multiplier from store (automatic bidirectional calculation)
    const multiplier = getMultiplier(source, target)

    // Apply multiplier first
    const adjustedValue = value * multiplier

    // Then apply smart rounding based on value ranges
    if (adjustedValue < 5) {
      // Round to nearest whole number
      return Math.round(adjustedValue)
    } else if (adjustedValue < 50) {
      // Round to nearest 5
      return Math.round(adjustedValue / 5) * 5
    } else if (adjustedValue < 200) {
      // Round to nearest 25
      return Math.round(adjustedValue / 25) * 25
    } else if (adjustedValue < 500) {
      // Round to nearest 50
      return Math.round(adjustedValue / 50) * 50
    } else {
      // Round to nearest 100
      return Math.round(adjustedValue / 100) * 100
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

    // Apply smart rounding with automatic multiplier
    return smartRound(converted, target, source)
  }

  return {
    getCurrencySymbol,
    convertPrice,
    smartRound,
    getMultiplier // Expose for advanced use cases
  }
}
