import type { Subscription } from '~/features/subscriptions/shared/types'
import type { Transaction } from '~/features/donor-portal/types'
import type { CampaignType, CampaignStatus } from '~/features/campaigns/shared/types'
import {
  useDonorPortalSettingsStore,
  type ActionGateConfig
} from '~/features/settings/admin/stores/donorPortalSettings'

export interface EligibilityInput {
  subscription?: Subscription
  transaction?: Transaction
  donorValueLastYear: number
  campaignType?: CampaignType
  isMatchedDonation?: boolean
  campaignStatus?: CampaignStatus
}

export interface EligibilityResult {
  canPause: boolean
  canCancel: boolean
  canRefund: boolean
  canChangeAmount: boolean
}

function getMonthsSince(dateStr: string): number {
  return Math.floor((Date.now() - new Date(dateStr).getTime()) / (30.44 * 24 * 60 * 60 * 1000))
}

interface RefundConfig {
  enabled: boolean
  windowDays: 30 | 60 | 90 | 180
  disableWhenCampaignEnded: boolean
  minDurationMonths?: number
  minDonorValueLastYear?: number
}

function isWithinRefundWindow(config: RefundConfig, createdAt: string | undefined): boolean {
  if (!createdAt) return false
  const windowMs = config.windowDays * 24 * 60 * 60 * 1000
  return Date.now() - new Date(createdAt).getTime() <= windowMs
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

  function resolveRefundConfig(input: EligibilityInput): RefundConfig {
    if (input.isMatchedDonation) return store.refundMatchedGiving
    const t = input.campaignType
    if (t === 'p2p' || t === 'p2p-fundraiser' || t === 'event') return store.refundP2P
    return store.refundStandard
  }

  function checkEligibility(input: EligibilityInput): EligibilityResult {
    const { subscription, transaction, donorValueLastYear } = input

    const canPause = subscription
      ? evaluateGate(store.pauseSubscription, subscription.createdAt, donorValueLastYear, false)
      : false

    const canCancel = subscription
      ? evaluateGate(store.cancelSubscription, subscription.createdAt, donorValueLastYear, false)
      : false

    const refundConfig = resolveRefundConfig(input)

    // Terminal state: campaign ended blocks refund
    if (
      refundConfig.disableWhenCampaignEnded &&
      input.campaignStatus &&
      (input.campaignStatus === 'completed' || input.campaignStatus === 'ended')
    ) {
      return { canPause, canCancel, canRefund: false, canChangeAmount: evaluateChangeAmount() }
    }

    const isOneTime = transaction?.type === 'one_time'
    const withinWindow = isWithinRefundWindow(refundConfig, transaction?.createdAt)

    // Build an ActionGateConfig-compatible object for evaluateGate
    const gateConfig: ActionGateConfig = {
      enabled: refundConfig.enabled,
      minDurationMonths: refundConfig.minDurationMonths ?? 0,
      minDonorValueLastYear: refundConfig.minDonorValueLastYear ?? 0
    }

    const canRefund =
      withinWindow &&
      evaluateGate(
        gateConfig,
        subscription?.createdAt ?? transaction?.createdAt,
        donorValueLastYear,
        isOneTime
      )

    const canChangeAmount = evaluateChangeAmount()

    return { canPause, canCancel, canRefund, canChangeAmount }

    function evaluateChangeAmount() {
      return subscription
        ? evaluateGate(store.changeAmount, subscription.createdAt, donorValueLastYear, false)
        : false
    }
  }

  return { checkEligibility }
}
