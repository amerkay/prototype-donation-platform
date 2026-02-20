import type { FrequencySettings } from '~/features/donation-form/shared/types'

/**
 * Convert all preset amounts and custom ranges in frequency settings.
 * Used by per-form baseDefaultCurrency change in AdminDonationFormConfig.
 */
export function convertFrequencyAmounts(
  frequencies: Record<string, FrequencySettings>,
  fromCurrency: string,
  toCurrency: string,
  convertFn: (amount: number, to: string, from: string) => number
): void {
  for (const freq of Object.values(frequencies)) {
    if (!freq.enabled) continue
    for (const preset of freq.presetAmounts) {
      if (preset.amount > 0) {
        preset.amount = convertFn(preset.amount, toCurrency, fromCurrency)
      }
    }
    if (freq.customAmount) {
      freq.customAmount.min = convertFn(freq.customAmount.min, toCurrency, fromCurrency)
      freq.customAmount.max = convertFn(freq.customAmount.max, toCurrency, fromCurrency)
    }
  }
}
