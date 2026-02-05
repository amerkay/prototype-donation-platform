import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { CharitySettings, CharityCurrencyOverride } from '~/features/settings/admin/types'
import { charitySettings } from '~/sample-api-responses/api-sample-response-settings'
import { useEditableState } from '~/features/_admin/composables/defineEditableStore'

/**
 * Organization-level charity settings store
 *
 * Provides charity identity data used across donor-facing pages.
 * Per-currency overrides allow different registration details per jurisdiction.
 */
export const useCharitySettingsStore = defineStore('charitySettings', () => {
  const { isDirty, isSaving, markDirty, markClean } = useEditableState()

  // State
  const slug = ref(charitySettings.slug)
  const name = ref(charitySettings.name)
  const registrationNumber = ref(charitySettings.registrationNumber)
  const address = ref(charitySettings.address)
  const website = ref(charitySettings.website)
  const description = ref(charitySettings.description)
  const currencyOverrides = ref<Record<string, CharityCurrencyOverride>>({
    ...charitySettings.currencyOverrides
  })

  // Getters
  const getCharityForCurrency = computed(
    () =>
      (currency: string): { name: string; registrationNumber: string; address: string } => {
        const override = currencyOverrides.value[currency]
        if (override?.enabled) {
          return {
            name: override.name || name.value,
            registrationNumber: override.registrationNumber || registrationNumber.value,
            address: override.address || address.value
          }
        }
        return {
          name: name.value,
          registrationNumber: registrationNumber.value,
          address: address.value
        }
      }
  )

  // Actions
  function initialize(settings: CharitySettings) {
    slug.value = settings.slug
    name.value = settings.name
    registrationNumber.value = settings.registrationNumber
    address.value = settings.address
    website.value = settings.website
    description.value = settings.description
    currencyOverrides.value = { ...settings.currencyOverrides }
    markClean()
  }

  function updateSettings(settings: Partial<CharitySettings>) {
    if (settings.slug !== undefined) slug.value = settings.slug
    if (settings.name !== undefined) name.value = settings.name
    if (settings.registrationNumber !== undefined)
      registrationNumber.value = settings.registrationNumber
    if (settings.address !== undefined) address.value = settings.address
    if (settings.website !== undefined) website.value = settings.website
    if (settings.description !== undefined) description.value = settings.description
    if (settings.currencyOverrides !== undefined)
      currencyOverrides.value = { ...settings.currencyOverrides }
    markDirty()
  }

  // Persistence - hydrate on load, save only on explicit call
  let hydrated = false
  function $hydrate() {
    if (hydrated) return
    try {
      const saved = sessionStorage.getItem('settings-charity')
      if (saved) initialize(JSON.parse(saved))
    } catch {
      /* ignore */
    }
    hydrated = true
  }

  function save() {
    try {
      sessionStorage.setItem(
        'settings-charity',
        JSON.stringify({
          slug: slug.value,
          name: name.value,
          registrationNumber: registrationNumber.value,
          address: address.value,
          website: website.value,
          description: description.value,
          currencyOverrides: currencyOverrides.value
        })
      )
    } catch {
      /* ignore */
    }
  }

  // Hydrate immediately on client (before components render)
  if (import.meta.client) {
    $hydrate()
  }

  return {
    // State
    slug,
    name,
    registrationNumber,
    address,
    website,
    description,
    currencyOverrides,
    isDirty,
    isSaving,
    // Getters
    getCharityForCurrency,
    // Actions
    initialize,
    updateSettings,
    markDirty,
    markClean,
    $hydrate,
    save
  }
})
