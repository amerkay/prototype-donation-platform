import { computed } from 'vue'
import { useDonationFormStore } from '~/features/donation-form/stores/donationForm'
import { useImpactCartStore } from '~/features/donation-form/impact-cart/stores/impactCart'
import { useCurrency } from '~/features/donation-form/composables/useCurrency'

/**
 * Cover Costs Manager Composable
 *
 * Centralizes all cover costs logic in the feature folder.
 * Provides clean API for setting and reading cover costs values.
 *
 * Usage:
 * ```ts
 * const { coverCostsAmount, coverCostsType, setCoverCostsPercentage } = useCoverCostsManager()
 * ```
 */

// Constants
const THRESHOLD_AMOUNT_GBP = 10 // Threshold in base currency (GBP)

type CoverCostsType = 'percentage' | 'amount' | null

export function useCoverCostsManager() {
  const store = useDonationFormStore()
  const cartStore = useImpactCartStore()
  const { convertPrice } = useCurrency('GBP')

  // Current donation amount
  const donationAmount = computed(() => {
    if (store.activeTab === 'multiple') {
      return cartStore.cartTotal('multiple')
    }
    return store.donationAmounts[store.activeTab as 'once' | 'monthly' | 'yearly'] || 0
  })

  // Threshold in current currency
  const thresholdInCurrentCurrency = computed(() => {
    return convertPrice(THRESHOLD_AMOUNT_GBP, store.selectedCurrency)
  })

  // Determine if we should use percentage or fixed amount mode
  const shouldUsePercentageMode = computed(() => {
    return donationAmount.value >= thresholdInCurrentCurrency.value
  })

  // Get cover costs data from store
  const coverCostsData = computed(() => {
    return store.coverCosts
  })

  // Type of cover costs (percentage or amount)
  const coverCostsType = computed<CoverCostsType>(() => {
    return coverCostsData.value?.type || null
  })

  // Raw value (percentage or amount)
  const coverCostsValue = computed(() => {
    return coverCostsData.value?.value || 0
  })

  // Calculated amount in currency
  const coverCostsAmount = computed(() => {
    const data = coverCostsData.value
    if (!data || data.value === 0) return 0

    if (data.type === 'amount') {
      return data.value
    }

    if (data.type === 'percentage') {
      return donationAmount.value * (data.value / 100)
    }

    return 0
  })

  // Set cover costs as percentage
  function setCoverCostsPercentage(value: number) {
    store.setCoverCosts({ type: 'percentage', value })
  }

  // Set cover costs as fixed amount
  function setCoverCostsAmount(value: number) {
    store.setCoverCosts({ type: 'amount', value })
  }

  // Clear cover costs
  function clearCoverCosts() {
    store.setCoverCosts(null)
  }

  return {
    // Computed values
    donationAmount,
    currency: computed(() => store.selectedCurrency),
    thresholdInCurrentCurrency,
    shouldUsePercentageMode,
    coverCostsType,
    coverCostsValue,
    coverCostsAmount,

    // Actions
    setCoverCostsPercentage,
    setCoverCostsAmount,
    clearCoverCosts
  }
}
