import { describe, it, expect, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useCurrencySettingsStore } from '~/features/settings/admin/stores/currencySettings'
import { useCurrency } from '~/features/donation-form/shared/composables/useCurrency'

/**
 * Initialize currency store with known multipliers for deterministic tests.
 * Default currency: GBP, multipliers: USD=2.0, EUR=1.0
 * (matches sample data in api-sample-response-settings.ts)
 */
function setupStore() {
  const store = useCurrencySettingsStore()
  store.initialize({
    supportedCurrencies: ['GBP', 'USD', 'EUR'],
    defaultCurrency: 'GBP',
    currencyMultipliers: { USD: 2.0, EUR: 1.0 }
  })
  return store
}

describe('useCurrency', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  describe('getMultiplier', () => {
    it('returns 1.0 for same currency', () => {
      setupStore()
      const { getMultiplier } = useCurrency('GBP')
      expect(getMultiplier('GBP', 'GBP')).toBe(1.0)
    })

    it('returns stored multiplier for direct mapping (GBP→USD)', () => {
      setupStore()
      const { getMultiplier } = useCurrency('GBP')
      expect(getMultiplier('GBP', 'USD')).toBe(2.0)
    })

    it('returns inverse for reverse mapping (USD→GBP)', () => {
      setupStore()
      const { getMultiplier } = useCurrency('GBP')
      expect(getMultiplier('USD', 'GBP')).toBe(0.5)
    })

    it('calculates cross-currency (USD→EUR) through base', () => {
      setupStore()
      const { getMultiplier } = useCurrency('GBP')
      // USD→GBP = 0.5, GBP→EUR = 1.0 → 0.5 * 1.0 = 0.5
      expect(getMultiplier('USD', 'EUR')).toBe(0.5)
    })

    it('returns 1.0 for unconfigured currency', () => {
      setupStore()
      const { getMultiplier } = useCurrency('GBP')
      // CAD has no multiplier configured → defaults to 1.0 in lookups
      expect(getMultiplier('GBP', 'CAD')).toBe(1.0)
    })

    it('is case-insensitive', () => {
      setupStore()
      const { getMultiplier } = useCurrency('GBP')
      expect(getMultiplier('gbp', 'usd')).toBe(2.0)
    })
  })

  describe('smartRound', () => {
    beforeEach(() => {
      setupStore()
    })

    it('rounds value < 5 to nearest 1', () => {
      const { smartRound } = useCurrency('GBP')
      expect(smartRound(2.7, 'GBP', 'GBP')).toBe(3)
      expect(smartRound(4.3, 'GBP', 'GBP')).toBe(4)
    })

    it('rounds value = 5 to nearest 5', () => {
      const { smartRound } = useCurrency('GBP')
      expect(smartRound(5, 'GBP', 'GBP')).toBe(5)
    })

    it('rounds value 5-50 to nearest 5', () => {
      const { smartRound } = useCurrency('GBP')
      expect(smartRound(12, 'GBP', 'GBP')).toBe(10)
      expect(smartRound(23, 'GBP', 'GBP')).toBe(25)
    })

    it('rounds value = 50 to nearest 25', () => {
      const { smartRound } = useCurrency('GBP')
      expect(smartRound(50, 'GBP', 'GBP')).toBe(50)
    })

    it('rounds value 50-200 to nearest 25', () => {
      const { smartRound } = useCurrency('GBP')
      expect(smartRound(87, 'GBP', 'GBP')).toBe(75)
      expect(smartRound(112, 'GBP', 'GBP')).toBe(100)
      expect(smartRound(113, 'GBP', 'GBP')).toBe(125)
    })

    it('rounds value = 200 to nearest 50', () => {
      const { smartRound } = useCurrency('GBP')
      expect(smartRound(200, 'GBP', 'GBP')).toBe(200)
    })

    it('rounds value 200-500 to nearest 50', () => {
      const { smartRound } = useCurrency('GBP')
      expect(smartRound(230, 'GBP', 'GBP')).toBe(250)
      expect(smartRound(480, 'GBP', 'GBP')).toBe(500)
    })

    it('rounds value >= 500 to nearest 100', () => {
      const { smartRound } = useCurrency('GBP')
      expect(smartRound(523, 'GBP', 'GBP')).toBe(500)
      expect(smartRound(789, 'GBP', 'GBP')).toBe(800)
    })

    it('applies multiplier before rounding', () => {
      const { smartRound } = useCurrency('GBP')
      // GBP→USD multiplier is 2.0, so 10 * 2.0 = 20 → nearest 5 = 20
      expect(smartRound(10, 'USD', 'GBP')).toBe(20)
      // 12 * 2.0 = 24 → nearest 5 = 25
      expect(smartRound(12, 'USD', 'GBP')).toBe(25)
    })

    it('returns 0 for value = 0', () => {
      const { smartRound } = useCurrency('GBP')
      expect(smartRound(0, 'GBP', 'GBP')).toBe(0)
    })
  })

  describe('convertPrice', () => {
    beforeEach(() => {
      setupStore()
    })

    it('returns original price for same currency', () => {
      const { convertPrice } = useCurrency('GBP')
      expect(convertPrice(25, 'GBP')).toBe(25)
    })

    it('applies exchange rate + smartRound for valid rate', () => {
      const { convertPrice } = useCurrency('GBP')
      // GBP→USD: exchange rate 1.27, multiplier 2.0
      // 10 * 1.27 = 12.7 → smartRound(12.7, USD, GBP) = 12.7 * 2.0 = 25.4 → nearest 5 = 25
      expect(convertPrice(10, 'USD')).toBe(25)
    })

    it('handles small amount conversion', () => {
      const { convertPrice } = useCurrency('GBP')
      // £5 → USD: 5 * 1.27 = 6.35 → smartRound(6.35, USD, GBP) = 6.35 * 2.0 = 12.7 → nearest 5 = 15
      expect(convertPrice(5, 'USD')).toBe(15)
    })

    it('handles large amount conversion', () => {
      const { convertPrice } = useCurrency('GBP')
      // £500 → USD: 500 * 1.27 = 635 → smartRound(635, USD, GBP) = 635 * 2.0 = 1270 → nearest 100 = 1300
      expect(convertPrice(500, 'USD')).toBe(1300)
    })

    it('returns original + warns for missing rate', () => {
      const { convertPrice } = useCurrency('GBP')
      // XYZ has no exchange rate → returns original
      expect(convertPrice(100, 'XYZ', 'GBP')).toBe(100)
    })
  })

  describe('getConversionBreakdown', () => {
    beforeEach(() => {
      setupStore()
    })

    it('returns identity for same currency', () => {
      const { getConversionBreakdown } = useCurrency('GBP')
      const bd = getConversionBreakdown(50, 'GBP')
      expect(bd.original).toBe(50)
      expect(bd.exchangeRate).toBe(1)
      expect(bd.afterExchange).toBe(50)
      expect(bd.multiplier).toBe(1)
      expect(bd.afterMultiplier).toBe(50)
      expect(bd.final).toBe(50)
      expect(bd.roundingBucket).toBe('none')
    })

    it('returns correct exchangeRate and afterExchange', () => {
      const { getConversionBreakdown } = useCurrency('GBP')
      const bd = getConversionBreakdown(10, 'USD')
      expect(bd.exchangeRate).toBe(1.27)
      expect(bd.afterExchange).toBe(12.7)
    })

    it('returns correct multiplier and afterMultiplier', () => {
      const { getConversionBreakdown } = useCurrency('GBP')
      const bd = getConversionBreakdown(10, 'USD')
      expect(bd.multiplier).toBe(2.0)
      // 12.7 * 2.0 = 25.4
      expect(bd.afterMultiplier).toBe(25.4)
    })

    it('final matches convertPrice result', () => {
      const { getConversionBreakdown, convertPrice } = useCurrency('GBP')
      const bd = getConversionBreakdown(10, 'USD')
      expect(bd.final).toBe(convertPrice(10, 'USD'))
    })

    it('roundingBucket matches value range', () => {
      const { getConversionBreakdown } = useCurrency('GBP')
      // afterMultiplier = 12.7 * 2.0 = 25.4 → 5-50 range → 'nearest 5'
      const bd = getConversionBreakdown(10, 'USD')
      expect(bd.roundingBucket).toBe('nearest 5')
    })
  })
})
