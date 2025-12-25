import { computed, type Ref } from 'vue'
import { useCurrency } from '~/features/donation-form/composables/useCurrency'
import type { ImpactJourneySettings, ImpactMessage } from '../types'

/**
 * Composable for impact journey message matching
 * Finds the highest threshold message that matches the current donation amount
 */
export function useImpactJourneyMessages(
  frequency: Ref<string>,
  amount: Ref<number>,
  currency: Ref<string>,
  baseCurrency: string,
  config: Ref<ImpactJourneySettings>
) {
  const { convertPrice } = useCurrency(baseCurrency)

  const currentMessage = computed<ImpactMessage | null>(() => {
    const freqKey = frequency.value as 'once' | 'monthly' | 'yearly' | 'multiple'
    const freqConfig = config.value.frequencies[freqKey]

    if (!freqConfig?.enabled) return null

    // Convert amount from selected currency to base currency for threshold comparison
    const baseAmount = convertPrice(amount.value, baseCurrency, currency.value)

    // Find all matching messages (where donation >= threshold)
    const matchingMessages = freqConfig.messages.filter((m) => baseAmount >= m.threshold)

    // Return the message with the highest threshold (most specific match)
    if (matchingMessages.length === 0) return null

    return matchingMessages.reduce((highest, current) =>
      current.threshold > highest.threshold ? current : highest
    )
  })

  return { currentMessage }
}
