import { computed, type Ref } from 'vue'
import { useCurrency } from '~/features/donation-form/composables/useCurrency'
import type { ImpactJourneySettings, ImpactPerAmount } from '../types'

/**
 * Composable for impact journey - auto-generates impact from building blocks
 * Shows all impact items where item.amount <= donation amount
 */
export function useImpactJourneyMessages(
  frequency: Ref<string>,
  amount: Ref<number>,
  currency: Ref<string>,
  baseCurrency: string,
  config: Ref<ImpactJourneySettings>
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

  // Get next impact level above current donation (for amount increase upsell)
  const nextImpactLevel = computed<ImpactPerAmount | null>(() => {
    if (!config.value.enabled || !config.value.impactPerAmount?.items) return null

    // Convert amount from selected currency to base currency
    const baseAmount = convertPrice(amount.value, baseCurrency, currency.value)

    // Find first item where amount > current donation
    const sorted = [...config.value.impactPerAmount.items].sort((a, b) => a.amount - b.amount)
    return sorted.find((item) => item.amount > baseAmount) || null
  })

  // Check if upsell should be shown
  const showUpsell = computed<boolean>(() => {
    if (!config.value.upsell?.enabled) return false

    const freqKey = frequency.value as 'once' | 'monthly' | 'yearly'

    // Show once-to-monthly upsell on one-time donations
    if (freqKey === 'once' && config.value.upsell.onceToMonthly?.enabled) {
      return true
    }

    // Show increase-amount upsell on recurring donations
    if (
      (freqKey === 'monthly' || freqKey === 'yearly') &&
      config.value.upsell.increaseAmount?.enabled
    ) {
      return true
    }

    return false
  })

  // Get upsell message
  const upsellMessage = computed<string | null>(() => {
    if (!showUpsell.value || !config.value.upsell) return null

    const freqKey = frequency.value as 'once' | 'monthly' | 'yearly'

    if (freqKey === 'once' && config.value.upsell.onceToMonthly?.enabled) {
      return config.value.upsell.onceToMonthly.message
    }

    if (
      (freqKey === 'monthly' || freqKey === 'yearly') &&
      config.value.upsell.increaseAmount?.enabled
    ) {
      // If there's a next level, show dynamic message with what it provides
      if (nextImpactLevel.value) {
        const nextAmount = convertPrice(nextImpactLevel.value.amount, currency.value, baseCurrency)
        const { getCurrencySymbol } = useCurrency(baseCurrency)
        return `${config.value.upsell.increaseAmount.message} Increase to ${getCurrencySymbol(currency.value)}${nextAmount} to provide: ${nextImpactLevel.value.label}`
      }
      return config.value.upsell.increaseAmount.message
    }

    return null
  })

  // Get suggested target amount for upsell
  const upsellTargetAmount = computed<number | undefined>(() => {
    if (!showUpsell.value || !config.value.upsell) return undefined

    const freqKey = frequency.value as 'once' | 'monthly' | 'yearly'

    if (freqKey === 'once' && config.value.upsell.onceToMonthly?.targetAmount) {
      return config.value.upsell.onceToMonthly.targetAmount
    }

    // For amount increase, return next level amount converted to selected currency
    if (
      (freqKey === 'monthly' || freqKey === 'yearly') &&
      config.value.upsell.increaseAmount?.enabled &&
      nextImpactLevel.value
    ) {
      return convertPrice(nextImpactLevel.value.amount, currency.value, baseCurrency)
    }

    return undefined
  })

  return {
    providedItems,
    nextImpactLevel,
    showUpsell,
    upsellMessage,
    upsellTargetAmount
  }
}
