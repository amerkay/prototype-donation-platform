import { defineSettingsStore } from '~/features/_admin/composables/defineSettingsStore'

export interface ActionGateConfig {
  enabled: boolean
  minDurationMonths: number
  minDonorValueLastYear: number
}

export interface DonorPortalSettings {
  pauseSubscription: ActionGateConfig
  cancelSubscription: ActionGateConfig
  requestRefund: ActionGateConfig
}

const DEFAULT_ACTION: ActionGateConfig = {
  enabled: true,
  minDurationMonths: 0,
  minDonorValueLastYear: 0
}

const DEFAULTS: DonorPortalSettings = {
  pauseSubscription: { ...DEFAULT_ACTION },
  cancelSubscription: { ...DEFAULT_ACTION },
  requestRefund: { ...DEFAULT_ACTION }
}

export const useDonorPortalSettingsStore = defineSettingsStore<DonorPortalSettings>(
  'donorPortalSettings',
  { defaults: DEFAULTS, storageKey: 'settings-donor-portal' }
)
