import type { InjectionKey, MaybeRefOrGetter, Ref } from 'vue'
import type { MatchedGivingSettings } from '~/features/campaigns/features/matched-giving/shared/types'
import type { DonationFrequency } from '~/features/campaigns/features/matched-giving/shared/utils/matchPeriodUtils'
import { getActivePeriod } from '~/features/campaigns/features/matched-giving/shared/utils/matchPeriodUtils'
import { formatCurrency } from '~/lib/formatCurrency'

/**
 * Injection key for matched giving context.
 * Provided by DonateDialog, consumed by AmountSelector.
 */
export const MATCHED_GIVING_KEY: InjectionKey<Ref<MatchedGivingSettings | undefined>> =
  Symbol('matchedGiving')

/**
 * Injection key for the current donation frequency.
 * Provided by DonateDialog, consumed by AmountSelector for match eligibility.
 */
export const DONATION_FREQUENCY_KEY: InjectionKey<Ref<DonationFrequency>> =
  Symbol('donationFrequency')

/**
 * Inject matched giving settings from campaign context.
 * Returns the active period's multiplier, matcher info, and computed impact amounts.
 * For recurring donations, only the first installment is matched.
 *
 * Pass donation amounts to get computed matchedAmount / totalImpact with formatting.
 * Without amounts, only isMatched / multiplier / activePeriod are available.
 */
export function useMatchedGiving(
  donationAmount?: MaybeRefOrGetter<number>,
  totalAmount?: MaybeRefOrGetter<number>,
  currency?: MaybeRefOrGetter<string>
) {
  const matchedGiving = inject(MATCHED_GIVING_KEY, ref(undefined))
  const frequency = inject(DONATION_FREQUENCY_KEY, ref<DonationFrequency>('once'))

  const activePeriod = computed(() => {
    if (!matchedGiving.value?.periods?.length) return null
    return getActivePeriod(matchedGiving.value.periods)
  })

  /** Match is active when an active period exists (any frequency) */
  const isMatched = computed(() => activePeriod.value != null)

  /** True for recurring donations — signals UI to show "first payment only" messaging */
  const isFirstInstallmentOnly = computed(
    () => activePeriod.value != null && frequency.value !== 'once'
  )

  /** Match multiplier for display: 2 = "2× match" (same number admin entered) */
  const multiplier = computed(() => activePeriod.value?.matchMultiplier ?? 1)

  // Computed impact amounts (only meaningful when donation amounts are provided)
  const amt = computed(() => toValue(donationAmount ?? 0))
  const total = computed(() => toValue(totalAmount ?? 0))
  const curr = computed(() => toValue(currency ?? 'USD'))

  /** Sponsor's matched portion: donationAmount × (multiplier - 1) */
  const matchedAmount = computed(() => (isMatched.value ? amt.value * (multiplier.value - 1) : 0))

  /** Total impact: total charged + matched amount */
  const totalImpact = computed(() => total.value + matchedAmount.value)

  const formattedMatchedAmount = computed(() => formatCurrency(matchedAmount.value, curr.value))
  const formattedTotalImpact = computed(() => formatCurrency(totalImpact.value, curr.value))

  return {
    matchedGiving,
    activePeriod,
    isMatched,
    isFirstInstallmentOnly,
    multiplier,
    matchedAmount,
    totalImpact,
    formattedMatchedAmount,
    formattedTotalImpact
  }
}
