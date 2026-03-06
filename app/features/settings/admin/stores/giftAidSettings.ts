import type { GiftAidOrgSettings } from '~/features/settings/admin/types'
import { giftAidSettings as defaults } from '~/sample-api-responses/api-sample-response-settings'
import { defineSettingsStore } from '~/features/_admin/composables/defineSettingsStore'

export const useGiftAidSettingsStore = defineSettingsStore<GiftAidOrgSettings>('giftAidSettings', {
  defaults,
  storageKey: 'settings-gift-aid'
})
