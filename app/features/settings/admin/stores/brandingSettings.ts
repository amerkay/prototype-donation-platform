import type { BrandingSettings } from '~/features/settings/admin/types'
import { brandingSettings as defaults } from '~/sample-api-responses/api-sample-response-settings'
import { defineSettingsStore } from '~/features/_admin/composables/defineSettingsStore'

export const useBrandingSettingsStore = defineSettingsStore<BrandingSettings>('brandingSettings', {
  defaults,
  storageKey: 'settings-branding'
})
