import { computed, type Ref } from 'vue'
import {
  useCurrency,
  getCurrencySymbol
} from '~/features/donation-form/shared/composables/useCurrency'
import type { ImpactJourneySettings } from '~/features/donation-form/features/impact-journey/admin/types'
import type { ImpactPerAmount } from '~/features/donation-form/features/impact-journey/donor/types'
import type { PricingSettings } from '~/features/donation-form/shared/types'

/**
 * Composable for impact journey - auto-generates impact messages and CTAs
 * Shows all impact items where item.amount <= donation amount
 */
export function useImpactJourneyMessages(
  frequency: Ref<string>,
  amount: Ref<number>,
  currency: Ref<string>,
  baseCurrency: string,
  config: Ref<ImpactJourneySettings>,
  pricingConfig: Ref<PricingSettings>
) {
  const { convertPrice } = useCurrency(baseCurrency)

  // ============================================================================
  // STEP 1: Calculate provided items based on donation amount
  // ============================================================================

  const providedItems = computed<ImpactPerAmount[]>(() => {
    if (!config.value.enabled || !config.value.impactPerAmount?.items) return []

    // Convert to base currency for comparison
    let baseAmount = convertPrice(amount.value, baseCurrency, currency.value)

    // Yearly: convert to monthly equivalent (£120/year = £10/month)
    if (frequency.value === 'yearly') {
      baseAmount = baseAmount / 12
    }

    return config.value.impactPerAmount.items
      .filter((item: ImpactPerAmount) => item.amount <= baseAmount)
      .sort((a: ImpactPerAmount, b: ImpactPerAmount) => a.amount - b.amount)
  })

  // ============================================================================
  // STEP 2: Generate display content (headline, subtitle, list)
  // ============================================================================

  const emoji = computed<string>(() => config.value.messaging?.emoji || '🌱')

  const timeFrameHeadline = computed<string>(() => {
    const freqKey = frequency.value as 'once' | 'monthly' | 'yearly'
    const messaging = config.value.messaging

    if (freqKey === 'monthly') {
      return messaging?.monthlyHeadline || "Every Day You're There"
    }
    if (freqKey === 'yearly') {
      return messaging?.yearlyHeadline || "Every Day You're There"
    }
    return messaging?.onceHeadline || 'Your Support Today'
  })

  // const multiplierText = computed<string | null>(() => {
  //   const freqKey = frequency.value as 'once' | 'monthly' | 'yearly'
  //   const currencySymbol = getCurrencySymbol(currency.value)
  //   const formattedAmount = `${currencySymbol}${amount.value}`

  //   if (freqKey === 'monthly') {
  //     return `Monthly support = reliable care they count on`
  //   }
  //   if (freqKey === 'yearly') {
  //     return `Yearly support = consistent care all year long`
  //   }
  //   return `Your ${formattedAmount} provides immediate care`
  // })

  const impactListInline = computed<string | null>(() => {
    if (providedItems.value.length === 0) return null
    return providedItems.value.map((item) => item.label).join(' • ')
  })

  const impactListPrefix = computed<string>(() => {
    return 'Provides:'
  })

  // ============================================================================
  // STEP 3: Calculate upsell logic (if enabled)
  // ============================================================================

  // Find next preset amount for increase upsell
  const nextPresetAmount = computed<number | null>(() => {
    const freqKey = frequency.value as 'once' | 'monthly' | 'yearly'
    const freqConfig = pricingConfig.value.frequencies[freqKey]
    if (!freqConfig?.enabled || !freqConfig.presetAmounts) return null

    const baseAmount = convertPrice(amount.value, baseCurrency, currency.value)
    const amounts = freqConfig.presetAmounts.map((preset) => preset.amount)
    const sorted = [...amounts].sort((a, b) => a - b)
    return sorted.find((preset) => preset > baseAmount) || null
  })

  // Determine which recurring frequency to suggest (monthly or yearly)
  const targetRecurringFrequency = computed<'monthly' | 'yearly' | null>(() => {
    // Prefer monthly, fallback to yearly if monthly disabled
    if (pricingConfig.value.frequencies.monthly?.enabled) return 'monthly'
    if (pricingConfig.value.frequencies.yearly?.enabled) return 'yearly'
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

    const freqConfig = pricingConfig.value.frequencies[targetFreq]
    if (!freqConfig?.enabled || !freqConfig.presetAmounts) return null

    // Convert current amount to base currency
    const baseAmount = convertPrice(amount.value, baseCurrency, currency.value)

    // Calculate target: 66.6% for monthly, 100% for yearly
    const targetAmount = targetFreq === 'monthly' ? baseAmount * (2 / 3) : baseAmount

    const amounts = freqConfig.presetAmounts.map((preset) => preset.amount)

    // Find closest preset
    return findClosestPreset(targetAmount, amounts)
  })

  // Check if upsell CTA should be shown
  const showUpsell = computed<boolean>(() => {
    const freqKey = frequency.value as 'once' | 'monthly' | 'yearly'

    // One-time → recurring conversion
    if (
      freqKey === 'once' &&
      config.value.upsells?.upsellOnceToRecurring &&
      targetRecurringFrequency.value
    ) {
      return true
    }

    // Amount increase (only if next level exists)
    if (
      (freqKey === 'monthly' || freqKey === 'yearly') &&
      config.value.upsells?.upsellIncreaseAmount &&
      nextPresetAmount.value !== null
    ) {
      return true
    }

    return false
  })

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
      config.value.upsells?.upsellIncreaseAmount &&
      nextPresetAmount.value
    ) {
      return convertPrice(nextPresetAmount.value, currency.value, baseCurrency)
    }

    return undefined
  })

  // Generate CTA button text
  const ctaCopy = computed<string>(() => {
    const freqKey = frequency.value as 'once' | 'monthly' | 'yearly'
    const currencySymbol = getCurrencySymbol(currency.value)
    const emojiStr = emoji.value

    // One-time → recurring
    if (freqKey === 'once' && targetRecurringFrequency.value) {
      const targetAmount = upsellTargetAmount.value || amount.value
      const targetFreq = targetRecurringFrequency.value
      const freqLabel = targetFreq === 'monthly' ? 'month' : 'year'
      const ctaText = config.value.upsells?.upsellCtaCopy || 'Be Their Constant'
      return `${emojiStr} Give ${currencySymbol}${targetAmount}/${freqLabel} – ${ctaText}`
    }

    // Amount increase
    if (upsellTargetAmount.value) {
      const ctaText = config.value.upsells?.upsellIncreaseCtaCopy || 'Greater Impact'
      return `${emojiStr} Increase to ${currencySymbol}${upsellTargetAmount.value} – ${ctaText}`
    }

    return `${emojiStr} Increase My Impact`
  })

  return {
    providedItems,
    showUpsell,
    upsellTargetAmount,
    targetRecurringFrequency,
    emoji,
    timeFrameHeadline,
    // multiplierText,
    impactListInline,
    impactListPrefix,
    ctaCopy
  }
}
