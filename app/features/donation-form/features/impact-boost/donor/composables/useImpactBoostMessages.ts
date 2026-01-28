import { computed, type Ref } from 'vue'
import {
  useCurrency,
  getCurrencySymbol
} from '~/features/donation-form/shared/composables/useCurrency'
import type { ImpactBoostSettings } from '~/features/donation-form/features/impact-boost/admin/types'
import type { DonationAmountsSettings } from '~/features/donation-form/shared/types'

/**
 * Composable for impact boost - provides emotional upsell messages and CTAs
 * Simplified version focused on 2 upsell scenarios: one-time → recurring, and amount increase
 */
export function useImpactBoostMessages(
  frequency: Ref<string>,
  amount: Ref<number>,
  currency: Ref<string>,
  baseCurrency: string,
  config: Ref<ImpactBoostSettings>,
  donationAmountsConfig: Ref<DonationAmountsSettings>
) {
  const { convertPrice } = useCurrency(baseCurrency)

  // ============================================================================
  // STEP 1: Calculate upsell logic
  // ============================================================================

  // Find next preset amount for increase upsell
  const nextPresetAmount = computed<number | null>(() => {
    const freqKey = frequency.value as 'once' | 'monthly' | 'yearly'
    const freqConfig = donationAmountsConfig.value.frequencies[freqKey]
    if (!freqConfig?.enabled || !freqConfig.presetAmounts) return null

    const baseAmount = convertPrice(amount.value, baseCurrency, currency.value)
    const amounts = freqConfig.presetAmounts.map((preset) => preset.amount)
    const sorted = [...amounts].sort((a, b) => a - b)
    return sorted.find((preset) => preset > baseAmount) || null
  })

  // Determine which recurring frequency to suggest (monthly or yearly)
  const targetRecurringFrequency = computed<'monthly' | 'yearly' | null>(() => {
    // Prefer monthly, fallback to yearly if monthly disabled
    if (donationAmountsConfig.value.frequencies.monthly?.enabled) return 'monthly'
    if (donationAmountsConfig.value.frequencies.yearly?.enabled) return 'yearly'
    return null
  })

  // Helper: Find closest preset to a target value
  const findClosestPreset = (target: number, presets: number[]): number | null => {
    if (!presets || presets.length === 0) return null
    return presets.reduce((closest, preset) => {
      return Math.abs(preset - target) < Math.abs(closest - target) ? preset : closest
    })
  }

  // Auto-calculate target recurring amount
  // Monthly: 66.6% of one-time amount | Yearly: closest to one-time amount
  const autoCalculatedRecurringAmount = computed<number | null>(() => {
    const targetFreq = targetRecurringFrequency.value
    if (!targetFreq) return null

    const freqConfig = donationAmountsConfig.value.frequencies[targetFreq]
    if (!freqConfig?.enabled || !freqConfig.presetAmounts) return null

    // Convert current amount to base currency
    const baseAmount = convertPrice(amount.value, baseCurrency, currency.value)

    // Calculate target: 66.6% for monthly, 100% for yearly
    const targetAmount = targetFreq === 'monthly' ? baseAmount * (2 / 3) : baseAmount

    const amounts = freqConfig.presetAmounts.map((preset) => preset.amount)

    // Find closest preset
    return findClosestPreset(targetAmount, amounts)
  })

  // Determine upsell type and whether to show
  const upsellType = computed<'recurring' | 'increase' | null>(() => {
    const freqKey = frequency.value as 'once' | 'monthly' | 'yearly'

    // One-time → recurring conversion
    if (
      freqKey === 'once' &&
      config.value.upsells?.enableRecurringBoost &&
      targetRecurringFrequency.value
    ) {
      return 'recurring'
    }

    // Amount increase (only if next level exists)
    if (
      (freqKey === 'monthly' || freqKey === 'yearly') &&
      config.value.upsells?.enableIncreaseBoost &&
      nextPresetAmount.value !== null
    ) {
      return 'increase'
    }

    return null
  })

  const showUpsell = computed<boolean>(() => upsellType.value !== null)

  // Calculate target amount (converted to user's currency)
  const upsellTargetAmount = computed<number | undefined>(() => {
    if (!showUpsell.value) return undefined

    const freqKey = frequency.value as 'once' | 'monthly' | 'yearly'

    // One-time → recurring: use auto-calculated amount
    if (freqKey === 'once' && autoCalculatedRecurringAmount.value) {
      return convertPrice(autoCalculatedRecurringAmount.value, currency.value, baseCurrency)
    }

    // Amount increase: use next preset
    if (
      (freqKey === 'monthly' || freqKey === 'yearly') &&
      config.value.upsells?.enableIncreaseBoost &&
      nextPresetAmount.value
    ) {
      return convertPrice(nextPresetAmount.value, currency.value, baseCurrency)
    }

    return undefined
  })

  // ============================================================================
  // STEP 2: Generate display content (message + CTA)
  // ============================================================================

  // Get emotional message based on upsell type
  const emotionalMessage = computed<string>(() => {
    if (upsellType.value === 'recurring') {
      return (
        config.value.messages?.recurringBoostMessage ||
        'Your monthly gift means they can count on you every single day'
      )
    }
    if (upsellType.value === 'increase') {
      return (
        config.value.messages?.increaseBoostMessage ||
        'A little more today creates lasting change tomorrow'
      )
    }
    return ''
  })

  // Generate CTA button text
  const ctaCopy = computed<string>(() => {
    const currencySymbol = getCurrencySymbol(currency.value)

    // One-time → recurring
    if (upsellType.value === 'recurring' && targetRecurringFrequency.value) {
      const targetAmount = upsellTargetAmount.value || amount.value
      const targetFreq = targetRecurringFrequency.value
      const freqLabel = targetFreq === 'monthly' ? 'month' : 'year'
      return `Give ${currencySymbol}${targetAmount}/${freqLabel}`
    }

    // Amount increase
    if (upsellType.value === 'increase' && upsellTargetAmount.value) {
      return `Increase to ${currencySymbol}${upsellTargetAmount.value}`
    }

    return 'Boost My Impact'
  })

  return {
    showUpsell,
    upsellType,
    upsellTargetAmount,
    targetRecurringFrequency,
    emotionalMessage,
    ctaCopy
  }
}
