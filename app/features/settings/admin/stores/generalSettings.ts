import type { GeneralSettings } from '~/features/settings/admin/types'
import { generalSettings as defaults } from '~/sample-api-responses/api-sample-response-settings'
import { defineSettingsStore } from '~/features/_admin/composables/defineSettingsStore'

export const useGeneralSettingsStore = defineSettingsStore<GeneralSettings>('generalSettings', {
  defaults,
  storageKey: 'settings-general'
})
