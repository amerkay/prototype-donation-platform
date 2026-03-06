import { defineSettingsStore } from '~/features/_admin/composables/defineSettingsStore'

export interface ActionGateConfig {
  enabled: boolean
  minDurationMonths: number
  minDonorValueLastYear: number
}

export interface RefundGateConfig extends ActionGateConfig {
  windowDays: 30 | 60 | 90 | 180
  disableWhenCampaignEnded: boolean
}

export interface P2PRefundGateConfig {
  enabled: boolean
  windowDays: 30 | 60 | 90 | 180
  disableWhenCampaignEnded: boolean
}

export interface MatchedRefundGateConfig {
  enabled: boolean
  windowDays: 30 | 60 | 90 | 180
  disableWhenCampaignEnded: boolean
}

export interface DonorPortalSettings {
  pauseSubscription: ActionGateConfig
  cancelSubscription: ActionGateConfig
  changeAmount: ActionGateConfig
  refundStandard: RefundGateConfig
  refundP2P: P2PRefundGateConfig
  refundMatchedGiving: MatchedRefundGateConfig
}

const DEFAULT_ACTION: ActionGateConfig = {
  enabled: true,
  minDurationMonths: 0,
  minDonorValueLastYear: 0
}

const DEFAULT_REFUND_BASE = {
  enabled: true,
  windowDays: 30 as const,
  disableWhenCampaignEnded: false
}

const DEFAULTS: DonorPortalSettings = {
  pauseSubscription: { ...DEFAULT_ACTION },
  cancelSubscription: { ...DEFAULT_ACTION },
  changeAmount: { ...DEFAULT_ACTION },
  refundStandard: { ...DEFAULT_ACTION, ...DEFAULT_REFUND_BASE },
  refundP2P: { ...DEFAULT_REFUND_BASE },
  refundMatchedGiving: { ...DEFAULT_REFUND_BASE }
}

export const useDonorPortalSettingsStore = defineSettingsStore<DonorPortalSettings>(
  'donorPortalSettings',
  { defaults: DEFAULTS, storageKey: 'settings-donor-portal' }
)
