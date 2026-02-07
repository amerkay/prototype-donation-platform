import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { GeneralSettings } from '~/features/settings/admin/types'
import { generalSettings as defaults } from '~/sample-api-responses/api-sample-response-settings'
import { useEditableState } from '~/features/_admin/composables/defineEditableStore'

export const useGeneralSettingsStore = defineStore('generalSettings', () => {
  const { isDirty, isSaving, markDirty, markClean } = useEditableState()

  const timezone = ref(defaults.timezone)
  const dateFormat = ref(defaults.dateFormat)
  const language = ref(defaults.language)
  const emailSenderName = ref(defaults.emailSenderName)
  const emailSenderAddress = ref(defaults.emailSenderAddress)
  const supportEmail = ref(defaults.supportEmail)

  function initialize(settings: GeneralSettings) {
    timezone.value = settings.timezone
    dateFormat.value = settings.dateFormat
    language.value = settings.language
    emailSenderName.value = settings.emailSenderName
    emailSenderAddress.value = settings.emailSenderAddress
    supportEmail.value = settings.supportEmail
    markClean()
  }

  function updateSettings(settings: Partial<GeneralSettings>) {
    if (settings.timezone !== undefined) timezone.value = settings.timezone
    if (settings.dateFormat !== undefined) dateFormat.value = settings.dateFormat
    if (settings.language !== undefined) language.value = settings.language
    if (settings.emailSenderName !== undefined) emailSenderName.value = settings.emailSenderName
    if (settings.emailSenderAddress !== undefined)
      emailSenderAddress.value = settings.emailSenderAddress
    if (settings.supportEmail !== undefined) supportEmail.value = settings.supportEmail
    markDirty()
  }

  let hydrated = false
  function $hydrate() {
    if (hydrated) return
    try {
      const saved = sessionStorage.getItem('settings-general')
      if (saved) initialize(JSON.parse(saved))
    } catch {
      /* ignore */
    }
    hydrated = true
  }

  function save() {
    try {
      sessionStorage.setItem(
        'settings-general',
        JSON.stringify({
          timezone: timezone.value,
          dateFormat: dateFormat.value,
          language: language.value,
          emailSenderName: emailSenderName.value,
          emailSenderAddress: emailSenderAddress.value,
          supportEmail: supportEmail.value
        })
      )
    } catch {
      /* ignore */
    }
  }

  if (import.meta.client) $hydrate()

  return {
    timezone,
    dateFormat,
    language,
    emailSenderName,
    emailSenderAddress,
    supportEmail,
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
