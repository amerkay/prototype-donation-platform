import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { BrandingSettings } from '~/features/settings/admin/types'
import { brandingSettings as defaults } from '~/sample-api-responses/api-sample-response-settings'
import { useEditableState } from '~/features/_admin/composables/defineEditableStore'

export const useBrandingSettingsStore = defineStore('brandingSettings', () => {
  const { isDirty, isSaving, markDirty, markClean } = useEditableState()

  const logoUrl = ref(defaults.logoUrl)
  const faviconUrl = ref(defaults.faviconUrl)
  const primaryColor = ref(defaults.primaryColor)
  const secondaryColor = ref(defaults.secondaryColor)
  const accentColor = ref(defaults.accentColor)
  const fontFamily = ref(defaults.fontFamily)
  const customCss = ref(defaults.customCss)

  function initialize(settings: BrandingSettings) {
    logoUrl.value = settings.logoUrl
    faviconUrl.value = settings.faviconUrl
    primaryColor.value = settings.primaryColor
    secondaryColor.value = settings.secondaryColor
    accentColor.value = settings.accentColor
    fontFamily.value = settings.fontFamily
    customCss.value = settings.customCss
    markClean()
  }

  function updateSettings(settings: Partial<BrandingSettings>) {
    if (settings.logoUrl !== undefined) logoUrl.value = settings.logoUrl
    if (settings.faviconUrl !== undefined) faviconUrl.value = settings.faviconUrl
    if (settings.primaryColor !== undefined) primaryColor.value = settings.primaryColor
    if (settings.secondaryColor !== undefined) secondaryColor.value = settings.secondaryColor
    if (settings.accentColor !== undefined) accentColor.value = settings.accentColor
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
          faviconUrl: faviconUrl.value,
          primaryColor: primaryColor.value,
          secondaryColor: secondaryColor.value,
          accentColor: accentColor.value,
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
    faviconUrl,
    primaryColor,
    secondaryColor,
    accentColor,
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
