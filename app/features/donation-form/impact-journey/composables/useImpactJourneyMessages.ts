import { computed, type Ref } from 'vue'
import { useCurrency } from '~/features/donation-form/composables/useCurrency'
import type { ImpactJourneySettings, ImpactPerAmount } from '../types'
import type { PricingSettings } from '~/features/donation-form/types'

/**
 * Composable for impact journey - auto-generates impact from building blocks
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

  // Get all impact items provided at this donation level
  const providedItems = computed<ImpactPerAmount[]>(() => {
    if (!config.value.enabled || !config.value.impactPerAmount?.items) return []

    // Convert amount from selected currency to base currency
    const baseAmount = convertPrice(amount.value, baseCurrency, currency.value)

    // Return all items where amount <= donation amount
    return config.value.impactPerAmount.items
      .filter((item) => item.amount <= baseAmount)
      .sort((a, b) => a.amount - b.amount) // Sort by amount ascending
  })

  // Get next preset amount from pricing config (for amount increase upsell)
  const nextPresetAmount = computed<number | null>(() => {
    const freqKey = frequency.value as 'once' | 'monthly' | 'yearly'
    const freqConfig = pricingConfig.value.frequencies[freqKey]
    if (!freqConfig?.enabled || !freqConfig.presetAmounts) return null

    // Convert current amount from selected currency to base currency
    const baseAmount = convertPrice(amount.value, baseCurrency, currency.value)

    // Find first preset amount greater than current donation
    const sorted = [...freqConfig.presetAmounts].sort((a, b) => a - b)
    return sorted.find((preset) => preset > baseAmount) || null
  })

  // Check if upsell should be shown
  const showUpsell = computed<boolean>(() => {
    if (!config.value.upsellEnabled) return false

    const freqKey = frequency.value as 'once' | 'monthly' | 'yearly'

    // Show once-to-monthly upsell on one-time donations
    if (freqKey === 'once' && config.value.upsellOnceToMonthly?.enabled) {
      return true
    }

    // Show increase-amount upsell on recurring donations only if there's a next preset amount
    if (
      (freqKey === 'monthly' || freqKey === 'yearly') &&
      config.value.upsellIncreaseAmount?.enabled &&
      nextPresetAmount.value !== null
    ) {
      return true
    }

    return false
  })

  // Get upsell message
  const upsellMessage = computed<string | null>(() => {
    if (!showUpsell.value) return null

    const freqKey = frequency.value as 'once' | 'monthly' | 'yearly'

    if (freqKey === 'once' && config.value.upsellOnceToMonthly?.enabled) {
      return config.value.upsellOnceToMonthly.message
    }

    if (
      (freqKey === 'monthly' || freqKey === 'yearly') &&
      config.value.upsellIncreaseAmount?.enabled
    ) {
      return config.value.upsellIncreaseAmount.message
    }

    return null
  })

  // Get suggested target amount for upsell
  const upsellTargetAmount = computed<number | undefined>(() => {
    if (!showUpsell.value) return undefined

    const freqKey = frequency.value as 'once' | 'monthly' | 'yearly'

    if (freqKey === 'once' && config.value.upsellOnceToMonthly?.targetAmount) {
      return config.value.upsellOnceToMonthly.targetAmount
    }

    // For amount increase, use next preset amount from pricing config
    if (
      (freqKey === 'monthly' || freqKey === 'yearly') &&
      config.value.upsellIncreaseAmount?.enabled &&
      nextPresetAmount.value
    ) {
      return convertPrice(nextPresetAmount.value, currency.value, baseCurrency)
    }

    return undefined
  })

  return {
    providedItems,
    showUpsell,
    upsellMessage,
    upsellTargetAmount
  }
}
