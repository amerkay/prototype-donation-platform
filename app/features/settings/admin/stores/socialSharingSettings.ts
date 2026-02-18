import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import { useEditableState } from '~/features/_admin/composables/defineEditableStore'

export interface SocialSharingSettings {
  facebook: boolean
  twitter: boolean
  linkedin: boolean
  whatsapp: boolean
  email: boolean
}

const DEFAULTS: SocialSharingSettings = {
  facebook: true,
  twitter: true,
  linkedin: true,
  whatsapp: true,
  email: true
}

export const useSocialSharingSettingsStore = defineStore('socialSharingSettings', () => {
  const { isDirty, isSaving, markDirty, markClean } = useEditableState()

  const facebook = ref(DEFAULTS.facebook)
  const twitter = ref(DEFAULTS.twitter)
  const linkedin = ref(DEFAULTS.linkedin)
  const whatsapp = ref(DEFAULTS.whatsapp)
  const email = ref(DEFAULTS.email)

  /** Copy link is always available — not toggleable */
  const copyLink = computed(() => true)

  function initialize(settings: SocialSharingSettings) {
    facebook.value = settings.facebook
    twitter.value = settings.twitter
    linkedin.value = settings.linkedin
    whatsapp.value = settings.whatsapp
    email.value = settings.email
    markClean()
  }

  function updateSettings(settings: Partial<SocialSharingSettings>) {
    if (settings.facebook !== undefined) facebook.value = settings.facebook
    if (settings.twitter !== undefined) twitter.value = settings.twitter
    if (settings.linkedin !== undefined) linkedin.value = settings.linkedin
    if (settings.whatsapp !== undefined) whatsapp.value = settings.whatsapp
    if (settings.email !== undefined) email.value = settings.email
    markDirty()
  }

  let hydrated = false
  function $hydrate() {
    if (hydrated) return
    try {
      const saved = sessionStorage.getItem('settings-social-sharing')
      if (saved) initialize(JSON.parse(saved))
    } catch {
      /* ignore */
    }
    hydrated = true
  }

  function save() {
    try {
      sessionStorage.setItem(
        'settings-social-sharing',
        JSON.stringify({
          facebook: facebook.value,
          twitter: twitter.value,
          linkedin: linkedin.value,
          whatsapp: whatsapp.value,
          email: email.value
        })
      )
    } catch {
      /* ignore */
    }
  }

  if (import.meta.client) $hydrate()

  return {
    facebook,
    twitter,
    linkedin,
    whatsapp,
    email,
    copyLink,
    isDirty,
    isSaving,
    initialize,
    updateSettings,
    markDirty,
    markClean,
    $hydrate,
    save
  }
})
