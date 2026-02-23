import { defineSettingsStore } from '~/features/_admin/composables/defineSettingsStore'

export interface AfterSaleSettings {
  // Recurring upsell
  recurringUpsellEnabled: boolean
  recurringUpsellFraction: string
  recurringUpsellHeadline: string
  recurringUpsellBody: string

  // Social sharing
  socialSharingEnabled: boolean
  socialSharingMessage: string
}

const DEFAULTS: AfterSaleSettings = {
  recurringUpsellEnabled: true,
  recurringUpsellFraction: '0.2',
  recurringUpsellHeadline: 'Keep making a difference',
  recurringUpsellBody:
    "Your {{amount}}/month could provide ongoing care for rescued orangutans — turning today's kindness into lasting change. That's {{yearly}}/year of sustained support.",

  socialSharingEnabled: true,
  socialSharingMessage: 'I just donated {{amount}} to {{campaign}}! Join me in making a difference.'
}

export const useAfterSaleSettingsStore = defineSettingsStore<AfterSaleSettings>(
  'afterSaleSettings',
  { defaults: DEFAULTS, storageKey: 'settings-after-sale' }
)
