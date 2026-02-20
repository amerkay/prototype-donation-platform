import { defineSettingsStore } from '~/features/_admin/composables/defineSettingsStore'

export interface SocialSharingSettings {
  facebook: boolean
  twitter: boolean
  linkedin: boolean
  whatsapp: boolean
  email: boolean
  copyLink: boolean
}

const DEFAULTS: SocialSharingSettings = {
  facebook: true,
  twitter: true,
  linkedin: true,
  whatsapp: true,
  email: true,
  copyLink: true
}

export const useSocialSharingSettingsStore = defineSettingsStore<SocialSharingSettings>(
  'socialSharingSettings',
  { defaults: DEFAULTS, storageKey: 'settings-social-sharing' }
)
