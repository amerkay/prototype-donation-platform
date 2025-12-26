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
    let baseAmount = convertPrice(amount.value, baseCurrency, currency.value)

    // For yearly donations, convert to monthly equivalent so impact messages make sense
    // e.g., £120/year = £10/month → show impact items up to £10
    if (frequency.value === 'yearly') {
      baseAmount = baseAmount / 12
    }

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

  // Determine target recurring frequency (prefer monthly, fallback to yearly)
  const targetRecurringFrequency = computed<'monthly' | 'yearly' | null>(() => {
    if (pricingConfig.value.frequencies.monthly?.enabled) return 'monthly'
    if (pricingConfig.value.frequencies.yearly?.enabled) return 'yearly'
    return null
  })

  // Check if upsell should be shown
  const showUpsell = computed<boolean>(() => {
    if (!config.value.upsellEnabled) return false

    const freqKey = frequency.value as 'once' | 'monthly' | 'yearly'

    // Show once-to-recurring upsell on one-time donations (only if recurring frequency available)
    if (
      freqKey === 'once' &&
      config.value.upsellOnceToRecurring?.enabled &&
      targetRecurringFrequency.value
    ) {
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

    if (freqKey === 'once' && config.value.upsellOnceToRecurring?.enabled) {
      return config.value.upsellOnceToRecurring.message
    }

    if (
      (freqKey === 'monthly' || freqKey === 'yearly') &&
      config.value.upsellIncreaseAmount?.enabled
    ) {
      return config.value.upsellIncreaseAmount.message
    }

    return null
  })

  // Get suggested target amount for upsell (converted to user's selected currency)
  const upsellTargetAmount = computed<number | undefined>(() => {
    if (!showUpsell.value) return undefined

    const freqKey = frequency.value as 'once' | 'monthly' | 'yearly'

    // For once-to-recurring: targetAmount is in base currency, convert to selected currency
    if (freqKey === 'once' && config.value.upsellOnceToRecurring?.targetAmount) {
      return convertPrice(
        config.value.upsellOnceToRecurring.targetAmount,
        currency.value,
        baseCurrency
      )
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
    upsellTargetAmount,
    targetRecurringFrequency
  }
}
