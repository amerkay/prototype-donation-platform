import { defineSettingsStore } from '~/features/_admin/composables/defineSettingsStore'

export interface ActionGateConfig {
  enabled: boolean
  minDurationMonths: number
  minDonorValueLastYear: number
}

export interface RefundGateConfig extends ActionGateConfig {
  windowDays: 30 | 60 | 90 | 180
}

export interface DonorPortalSettings {
  pauseSubscription: ActionGateConfig
  cancelSubscription: ActionGateConfig
  refund: RefundGateConfig
  changeAmount: ActionGateConfig
}

const DEFAULT_ACTION: ActionGateConfig = {
  enabled: true,
  minDurationMonths: 0,
  minDonorValueLastYear: 0
}

const DEFAULTS: DonorPortalSettings = {
  pauseSubscription: { ...DEFAULT_ACTION },
  cancelSubscription: { ...DEFAULT_ACTION },
  refund: { ...DEFAULT_ACTION, windowDays: 30 },
  changeAmount: { ...DEFAULT_ACTION }
}

export const useDonorPortalSettingsStore = defineSettingsStore<DonorPortalSettings>(
  'donorPortalSettings',
  { defaults: DEFAULTS, storageKey: 'settings-donor-portal' }
)
