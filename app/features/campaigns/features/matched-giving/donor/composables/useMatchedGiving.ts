import type { InjectionKey, Ref } from 'vue'
import type { MatchedGivingSettings } from '~/features/campaigns/features/matched-giving/shared/types'
import type { DonationFrequency } from '~/features/campaigns/features/matched-giving/shared/utils/matchPeriodUtils'
import { getActivePeriod } from '~/features/campaigns/features/matched-giving/shared/utils/matchPeriodUtils'

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
 * Returns the active period's multiplier and matcher info.
 * Only one-time donations are eligible for matching.
 */
export function useMatchedGiving() {
  const matchedGiving = inject(MATCHED_GIVING_KEY, ref(undefined))
  const frequency = inject(DONATION_FREQUENCY_KEY, ref<DonationFrequency>('once'))

  const activePeriod = computed(() => {
    if (!matchedGiving.value?.periods?.length) return null
    return getActivePeriod(matchedGiving.value.periods)
  })

  /** Match is active only for one-time donations with an active period */
  const isMatched = computed(() => activePeriod.value != null && frequency.value === 'once')
  const multiplier = computed(() => activePeriod.value?.multiplier ?? 1)

  return { matchedGiving, activePeriod, isMatched, multiplier }
}
