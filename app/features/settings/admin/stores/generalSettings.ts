import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { GeneralSettings } from '~/features/settings/admin/types'
import { generalSettings as defaults } from '~/sample-api-responses/api-sample-response-settings'
import { useEditableState } from '~/features/_admin/composables/defineEditableStore'

export const useGeneralSettingsStore = defineStore('generalSettings', () => {
  const { isDirty, isSaving, markDirty, markClean } = useEditableState()

  const timezone = ref(defaults.timezone)
  const dateFormat = ref(defaults.dateFormat)

  function initialize(settings: GeneralSettings) {
    timezone.value = settings.timezone
    dateFormat.value = settings.dateFormat
    markClean()
  }

  function updateSettings(settings: Partial<GeneralSettings>) {
    if (settings.timezone !== undefined) timezone.value = settings.timezone
    if (settings.dateFormat !== undefined) dateFormat.value = settings.dateFormat
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
          dateFormat: dateFormat.value
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
