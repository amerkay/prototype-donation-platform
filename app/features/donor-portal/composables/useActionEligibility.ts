import type { Subscription } from '~/features/subscriptions/shared/types'
import type { Transaction } from '~/features/donor-portal/types'
import {
  useDonorPortalSettingsStore,
  type ActionGateConfig
} from '~/features/settings/admin/stores/donorPortalSettings'

export interface EligibilityInput {
  subscription?: Subscription
  transaction?: Transaction
  donorValueLastYear: number
}

export interface EligibilityResult {
  canPause: boolean
  canCancel: boolean
  canRefund: boolean
}

function getMonthsSince(dateStr: string): number {
  return Math.floor((Date.now() - new Date(dateStr).getTime()) / (30.44 * 24 * 60 * 60 * 1000))
}

function evaluateGate(
  config: ActionGateConfig,
  createdAt: string | undefined,
  donorValueLastYear: number,
  skipDuration: boolean
): boolean {
  if (!config.enabled) return false

  const conditions: boolean[] = []

  if (config.minDurationMonths > 0 && !skipDuration && createdAt) {
    conditions.push(getMonthsSince(createdAt) >= config.minDurationMonths)
  }

  if (config.minDonorValueLastYear > 0) {
    conditions.push(donorValueLastYear >= config.minDonorValueLastYear)
  }

  if (conditions.length === 0) return true

  // AND logic: eligible only if ALL conditions are met
  return conditions.every(Boolean)
}

export function useActionEligibility() {
  const store = useDonorPortalSettingsStore()

  function checkEligibility(input: EligibilityInput): EligibilityResult {
    const { subscription, transaction, donorValueLastYear } = input

    // Debug: verify store config reaches portal (remove after testing)
    console.log('[eligibility] store config:', {
      pause: { ...store.pauseSubscription },
      cancel: { ...store.cancelSubscription },
      refundOneTime: { ...store.refundOneTime },
      refundSubscription: { ...store.refundSubscription }
    })

    const canPause = subscription
      ? evaluateGate(store.pauseSubscription, subscription.createdAt, donorValueLastYear, false)
      : false

    const canCancel = subscription
      ? evaluateGate(store.cancelSubscription, subscription.createdAt, donorValueLastYear, false)
      : false

    const isOneTime = transaction?.type === 'one_time'
    const refundConfig = isOneTime ? store.refundOneTime : store.refundSubscription
    const canRefund = evaluateGate(
      refundConfig,
      transaction?.createdAt ?? subscription?.createdAt,
      donorValueLastYear,
      isOneTime
    )

    console.log('[eligibility] results:', { canPause, canCancel, canRefund, donorValueLastYear })

    return { canPause, canCancel, canRefund }
  }

  return { checkEligibility }
}
