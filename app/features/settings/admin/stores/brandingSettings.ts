import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { BrandingSettings } from '~/features/settings/admin/types'
import { brandingSettings as defaults } from '~/sample-api-responses/api-sample-response-settings'
import { useEditableState } from '~/features/_admin/composables/defineEditableStore'

export const useBrandingSettingsStore = defineStore('brandingSettings', () => {
  const { isDirty, isSaving, markDirty, markClean } = useEditableState()

  const logoUrl = ref(defaults.logoUrl)
  const primaryColor = ref(defaults.primaryColor)
  const secondaryColor = ref(defaults.secondaryColor)
  const fontFamily = ref(defaults.fontFamily)
  const customCss = ref(defaults.customCss)

  function initialize(settings: BrandingSettings) {
    logoUrl.value = settings.logoUrl
    primaryColor.value = settings.primaryColor
    secondaryColor.value = settings.secondaryColor
    fontFamily.value = settings.fontFamily
    customCss.value = settings.customCss
    markClean()
  }

  function updateSettings(settings: Partial<BrandingSettings>) {
    if (settings.logoUrl !== undefined) logoUrl.value = settings.logoUrl
    if (settings.primaryColor !== undefined) primaryColor.value = settings.primaryColor
    if (settings.secondaryColor !== undefined) secondaryColor.value = settings.secondaryColor
    if (settings.fontFamily !== undefined) fontFamily.value = settings.fontFamily
    if (settings.customCss !== undefined) customCss.value = settings.customCss
    markDirty()
  }

  let hydrated = false
  function $hydrate() {
    if (hydrated) return
    try {
      const saved = sessionStorage.getItem('settings-branding')
      if (saved) initialize(JSON.parse(saved))
    } catch {
      /* ignore */
    }
    hydrated = true
  }

  function save() {
    try {
      sessionStorage.setItem(
        'settings-branding',
        JSON.stringify({
          logoUrl: logoUrl.value,
          primaryColor: primaryColor.value,
          secondaryColor: secondaryColor.value,
          fontFamily: fontFamily.value,
          customCss: customCss.value
        })
      )
    } catch {
      /* ignore */
    }
  }

  if (import.meta.client) $hydrate()

  return {
    logoUrl,
    primaryColor,
    secondaryColor,
    fontFamily,
    customCss,
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
